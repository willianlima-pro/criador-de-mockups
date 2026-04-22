#!/usr/bin/env node
/**
 * Gera mockup usando Gemini 3.1 Flash Image Preview com imagem de referência.
 * O rótulo/arte é enviado DIRETAMENTE para a API — não é descrito no prompt.
 * Saída nativa em 2K (2400×1792px para 4:3) via imageConfig.imageSize = "2K".
 *
 * Uso:
 *   node generate-with-reference.js <API_KEY> "<prompt_cena>" <imagem_referencia> [<arquivo_saida>]
 *
 * O prompt_cena descreve APENAS a embalagem e a cena — NUNCA o conteúdo do rótulo.
 * O rótulo vem da imagem de referência.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fallback upscale caso o modelo retorne abaixo de 2K
const OUTPUT_RESOLUTION_PX = 2048;
const UPSCALE_SCRIPT = path.join(__dirname, 'upscale-2k.py');

const [, , API_KEY, scenePrompt, refImagePath, outputArg] = process.argv;

if (!API_KEY || !scenePrompt || !refImagePath) {
  console.error('Uso: node generate-with-reference.js <API_KEY> "<prompt>" <ref_imagem> [saida]');
  console.error('Exemplo: node generate-with-reference.js AIzaSy... "supplement jar scene" rotulo.jpg');
  process.exit(1);
}

if (!fs.existsSync(refImagePath)) {
  console.error(`❌ Imagem de referência não encontrada: ${refImagePath}`);
  process.exit(1);
}

const outputDir = path.join(process.cwd(), 'Mockups Finalizados');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outputFile = outputArg || path.join(outputDir, `mockup-${timestamp}.png`);

const MIME_MAP = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

async function generate() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Ler imagem de referência como base64
  const ext = path.extname(refImagePath).toLowerCase();
  const mimeType = MIME_MAP[ext] || 'image/jpeg';
  const imageBase64 = fs.readFileSync(refImagePath).toString('base64');

  console.log(`🎨 Gerando mockup 2K nativo com Gemini 3.1 Flash Image Preview...`);
  console.log(`   Referência: ${path.basename(refImagePath)} (${mimeType})`);
  console.log(`   Cena: ${scenePrompt.slice(0, 80)}${scenePrompt.length > 80 ? '...' : ''}`);
  console.log(`   Resolução alvo: 2K nativa (4:3 → ~2400×1792px)`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{
      parts: [
        // A imagem do rótulo é enviada PRIMEIRO — sem descrever seu conteúdo
        {
          inline_data: {
            mime_type: mimeType,
            data: imageBase64
          }
        },
        // O prompt descreve APENAS a embalagem e a cena
        {
          text: `This is the exact label/artwork for the product. Do NOT change, reinterpret or describe its content — apply it exactly as-is to the product container.

${scenePrompt}

CRITICAL RULES:
- Apply the provided label image EXACTLY to the product surface, preserving all text, colors, logos and design elements
- The label should wrap naturally following the geometry of the container
- Do NOT invent, add or modify any element of the label
- The label content comes exclusively from the reference image above`
        }
      ]
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio: '4:3',
        imageSize: '2K'
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error(`❌ Erro API: ${data.error?.message || JSON.stringify(data)}`);
    process.exit(1);
  }

  // Extrair imagem gerada da resposta
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imagePart) {
    const textPart = parts.find(p => p.text);
    console.error('❌ Nenhuma imagem na resposta.');
    if (textPart) console.error('   Texto retornado:', textPart.text?.slice(0, 200));
    process.exit(1);
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
  const outMime = imagePart.inlineData.mimeType;
  const ext2 = outMime === 'image/png' ? '.png' : '.jpg';

  const finalPath = outputFile.replace(/\.(png|jpg|jpeg)$/i, '') + ext2;
  fs.writeFileSync(finalPath, buffer);

  // Verificar resolução nativa
  let nativeW = 0, nativeH = 0;
  try {
    const dims = execSync(`sips -g pixelWidth -g pixelHeight "${finalPath}"`).toString();
    nativeW = parseInt((dims.match(/pixelWidth:\s*(\d+)/)  || [])[1] || '0', 10);
    nativeH = parseInt((dims.match(/pixelHeight:\s*(\d+)/) || [])[1] || '0', 10);
  } catch { /* sips não disponível */ }

  const maxDim = Math.max(nativeW, nativeH);

  if (nativeW > 0 && maxDim >= OUTPUT_RESOLUTION_PX) {
    // Já é 2K nativo — sem upscale necessário
    const sz = (fs.statSync(finalPath).size / 1024).toFixed(1);
    console.log(`\n✅ Mockup 2K nativo salvo em: ${finalPath}`);
    console.log(`   Resolução: ${nativeW}×${nativeH}px | ${sz} KB`);
  } else if (nativeW > 0 && maxDim < OUTPUT_RESOLUTION_PX) {
    // Modelo retornou abaixo de 2K — fazer upscale como fallback
    console.log(`⚠️  Resolução nativa ${nativeW}×${nativeH}px — aplicando upscale PIL Lanczos...`);
    const nativePath = finalPath.replace(/(\.[^.]+)$/, '-native$1');
    fs.renameSync(finalPath, nativePath);
    try {
      const result = execSync(
        `python3 "${UPSCALE_SCRIPT}" "${nativePath}" "${finalPath}" --size ${OUTPUT_RESOLUTION_PX}`,
        { stdio: 'pipe' }
      ).toString().trim();
      console.log('\n' + result);
      fs.existsSync(nativePath) && fs.unlinkSync(nativePath);
    } catch {
      // Fallback: sips
      try {
        execSync(`sips -Z ${OUTPUT_RESOLUTION_PX} "${nativePath}" --out "${finalPath}"`, { stdio: 'pipe' });
        fs.unlinkSync(nativePath);
        const sz = (fs.statSync(finalPath).size / 1024).toFixed(1);
        console.log(`\n✅ Mockup 2K (upscale) salvo em: ${finalPath} (${sz} KB)`);
      } catch {
        fs.renameSync(nativePath, finalPath);
        console.log(`\n✅ Mockup salvo (nativo): ${finalPath}`);
        console.log(`   Tamanho: ${(buffer.length / 1024).toFixed(1)} KB`);
      }
    }
  } else {
    // sips não disponível — salvar direto
    const sz = (buffer.length / 1024).toFixed(1);
    console.log(`\n✅ Mockup salvo em: ${finalPath} (${sz} KB)`);
  }

  // Abrir imagem automaticamente
  try {
    execSync(`open "${finalPath}"`, { stdio: 'ignore' });
  } catch { /* ignora se open não disponível */ }

  return finalPath;
}

generate().catch(err => {
  console.error(`❌ Erro inesperado: ${err.message}`);
  process.exit(1);
});

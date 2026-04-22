#!/usr/bin/env node
/**
 * Edita uma imagem de mockup já gerada usando Gemini 3.1 Flash Image Preview.
 * Envia a imagem original + instrução de edição → retorna versão modificada em 2K.
 *
 * Uso:
 *   node edit-image.js <API_KEY> "<instrução_de_edição>" <imagem_entrada> [<arquivo_saida>]
 *
 * Exemplos de instrução:
 *   "change the background to dark marble"
 *   "make the capsules white instead of green"
 *   "add more dramatic lighting with darker shadows"
 *   "remove the spatula and add a mortar and pestle"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_RESOLUTION_PX = 2048;
const UPSCALE_SCRIPT = path.join(__dirname, 'upscale-2k.py');

const [, , API_KEY, editInstruction, inputImagePath, outputArg] = process.argv;

if (!API_KEY || !editInstruction || !inputImagePath) {
  console.error('Uso: node edit-image.js <API_KEY> "<instrução>" <imagem_entrada> [saida]');
  console.error('');
  console.error('Exemplos:');
  console.error('  node edit-image.js AIzaSy... "dark marble background" mockup.jpg');
  console.error('  node edit-image.js AIzaSy... "make capsules white" mockup.jpg edited.jpg');
  process.exit(1);
}

if (!fs.existsSync(inputImagePath)) {
  console.error(`❌ Imagem não encontrada: ${inputImagePath}`);
  process.exit(1);
}

const MIME_MAP = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const outputDir = path.join(process.cwd(), 'Mockups Finalizados');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Gerar nome de saída baseado no arquivo de entrada
const inputBase = path.basename(inputImagePath, path.extname(inputImagePath));
const defaultOutput = path.join(outputDir, `${inputBase}-editado-${timestamp}.jpg`);
const outputFile = outputArg || defaultOutput;

async function editImage() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const ext = path.extname(inputImagePath).toLowerCase();
  const mimeType = MIME_MAP[ext] || 'image/jpeg';
  const imageBase64 = fs.readFileSync(inputImagePath).toString('base64');

  console.log(`✏️  Editando mockup com Gemini 3.1 Flash Image Preview...`);
  console.log(`   Entrada: ${path.basename(inputImagePath)} (${mimeType})`);
  console.log(`   Instrução: ${editInstruction}`);
  console.log(`   Resolução alvo: 2K nativa (4:3 → ~2400×1792px)`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: mimeType,
            data: imageBase64
          }
        },
        {
          text: `This is an existing product mockup image. Apply the following edit instruction to it:

"${editInstruction}"

CRITICAL RULES:
- Keep EVERYTHING that is NOT mentioned in the edit instruction exactly as it is
- Preserve the product container shape, size and positioning
- Preserve the label artwork on the product — do NOT change any label text, colors or logo
- Preserve all lighting quality, photorealism and camera angle unless specifically asked to change
- Only modify what was explicitly requested in the instruction above
- Maintain the same 3D render / product photography quality and style
- All objects must remain firmly grounded on the surface with realistic shadows
- Zero floating elements — same professional studio quality as the original`
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
    console.error(`❌ Erro API: ${data.error?.message || JSON.stringify(data).slice(0, 200)}`);
    process.exit(1);
  }

  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imagePart) {
    const textPart = parts.find(p => p.text);
    console.error('❌ Nenhuma imagem na resposta.');
    if (textPart) console.error('   Texto retornado:', textPart.text?.slice(0, 300));
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
    const sz = (fs.statSync(finalPath).size / 1024).toFixed(1);
    console.log(`\n✅ Mockup editado 2K salvo em: ${finalPath}`);
    console.log(`   Resolução: ${nativeW}×${nativeH}px | ${sz} KB`);
  } else if (nativeW > 0 && maxDim < OUTPUT_RESOLUTION_PX) {
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
      try {
        execSync(`sips -Z ${OUTPUT_RESOLUTION_PX} "${nativePath}" --out "${finalPath}"`, { stdio: 'pipe' });
        fs.unlinkSync(nativePath);
        const sz = (fs.statSync(finalPath).size / 1024).toFixed(1);
        console.log(`\n✅ Mockup editado 2K salvo em: ${finalPath} (${sz} KB)`);
      } catch {
        fs.renameSync(nativePath, finalPath);
        console.log(`\n✅ Mockup editado salvo: ${finalPath}`);
      }
    }
  } else {
    const sz = (buffer.length / 1024).toFixed(1);
    console.log(`\n✅ Mockup editado salvo em: ${finalPath} (${sz} KB)`);
  }

  // Abrir imagem automaticamente
  try {
    execSync(`open "${finalPath}"`, { stdio: 'ignore' });
  } catch { /* ignora se open não disponível */ }

  return finalPath;
}

editImage().catch(err => {
  console.error(`❌ Erro inesperado: ${err.message}`);
  process.exit(1);
});

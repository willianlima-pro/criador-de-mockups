#!/usr/bin/env node
/**
 * Gera imagem de mockup usando Google Imagen 3.
 *
 * Uso (texto):
 *   node generate-image.js <API_KEY> "<prompt>" [<arquivo_saida>]
 *
 * Uso (com imagem de referência):
 *   node generate-image.js <API_KEY> "<prompt>" [<arquivo_saida>] --ref <caminho_imagem>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_RESOLUTION_PX = 2048; // 2K

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Uso: node generate-image.js <API_KEY> "<prompt>" [<saida>] [--ref <imagem>]');
  process.exit(1);
}

const API_KEY = args[0];
const prompt = args[1];

const refIdx = args.indexOf('--ref');
const refImagePath = refIdx !== -1 ? args[refIdx + 1] : null;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outputDir = path.join(process.cwd(), 'Mockups Finalizados');
const outputFile = args[2] && !args[2].startsWith('--')
  ? args[2]
  : path.join(outputDir, `mockup-${timestamp}.png`);

async function generateImage() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`;

  const instance = { prompt };

  if (refImagePath) {
    if (!fs.existsSync(refImagePath)) {
      console.error(`❌ Imagem de referência não encontrada: ${refImagePath}`);
      process.exit(1);
    }
    const refBytes = fs.readFileSync(refImagePath).toString('base64');
    const ext = path.extname(refImagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    instance.referenceImages = [{
      referenceType: 'REFERENCE_TYPE_STYLE',
      referenceImage: { bytesBase64Encoded: refBytes, mimeType }
    }];
    console.log(`📎 Usando imagem de referência: ${path.basename(refImagePath)}`);
  }

  console.log(`🎨 Gerando mockup com Imagen 4...`);
  console.log(`   Prompt: ${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        safetyFilterLevel: 'BLOCK_SOME'
      }
    })
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error(`❌ Erro Imagen 3: ${data.error?.message || 'resposta inválida'}`);
    process.exit(1);
  }

  if (!data.predictions?.length) {
    console.error('❌ Nenhuma imagem gerada (filtro de segurança ou prompt inválido)');
    process.exit(1);
  }

  const imageData = data.predictions[0].bytesBase64Encoded;
  const buffer = Buffer.from(imageData, 'base64');

  // Salvar nativo e upscale para 2K
  const nativePath = outputFile.replace(/\.(png|jpg|jpeg)$/i, '') + '-native.png';
  fs.writeFileSync(nativePath, buffer);

  let finalPath = outputFile;
  try {
    const dims = execSync(`sips -g pixelWidth -g pixelHeight "${nativePath}"`).toString();
    const w = parseInt((dims.match(/pixelWidth:\s*(\d+)/)  || [])[1] || '0', 10);
    const h = parseInt((dims.match(/pixelHeight:\s*(\d+)/) || [])[1] || '0', 10);

    if (w > 0 && Math.max(w, h) < OUTPUT_RESOLUTION_PX) {
      console.log(`🔍 Resolução nativa: ${w}×${h}px`);
      console.log(`⬆️  Upscale para 2K (${OUTPUT_RESOLUTION_PX}px)...`);
      execSync(`sips -Z ${OUTPUT_RESOLUTION_PX} "${nativePath}" --out "${finalPath}"`, { stdio: 'pipe' });
      fs.unlinkSync(nativePath);
      const fd = execSync(`sips -g pixelWidth -g pixelHeight "${finalPath}"`).toString();
      const fw = (fd.match(/pixelWidth:\s*(\d+)/)  || [])[1] || '?';
      const fh = (fd.match(/pixelHeight:\s*(\d+)/) || [])[1] || '?';
      const sz = fs.statSync(finalPath).size;
      console.log(`\n✅ Mockup 2K salvo em: ${finalPath}`);
      console.log(`   Resolução: ${fw}×${fh}px`);
      console.log(`   Tamanho: ${(sz / 1024).toFixed(1)} KB`);
    } else {
      fs.renameSync(nativePath, finalPath);
      console.log(`\n✅ Mockup salvo em: ${finalPath}`);
      console.log(`   Resolução: ${w}×${h}px (já em 2K)`);
      console.log(`   Tamanho: ${(buffer.length / 1024).toFixed(1)} KB`);
    }
  } catch {
    fs.renameSync(nativePath, finalPath);
    console.log(`\n✅ Mockup salvo em: ${finalPath}`);
    console.log(`   Tamanho: ${(buffer.length / 1024).toFixed(1)} KB`);
  }

  // Abrir imagem automaticamente
  try {
    execSync(`open "${finalPath}"`, { stdio: 'ignore' });
  } catch { /* ignora se open não disponível */ }

  return finalPath;
}

generateImage().catch(err => {
  console.error(`❌ Erro inesperado: ${err.message}`);
  process.exit(1);
});

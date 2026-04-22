#!/usr/bin/env node
/**
 * Testa a chave de API do Google AI Studio.
 * Uso: node test-google-api.js <API_KEY>
 */

const API_KEY = process.argv[2] || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('ERRO: Chave de API obrigatória.');
  console.error('Uso: node test-google-api.js <SUA_CHAVE_API>');
  process.exit(1);
}

async function testAPI() {
  try {
    // Passo 1: validar chave listando modelos
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (!listRes.ok) {
      const msg = listData.error?.message || 'Resposta inválida';
      console.error(`❌ Chave inválida: ${msg}`);
      process.exit(1);
    }

    const models = listData.models || [];
    const hasImagen = models.some(m => m.name?.includes('imagen'));
    const hasGemini = models.some(m => m.name?.includes('gemini'));

    console.log(`✅ Chave válida — ${models.length} modelos disponíveis`);
    console.log(`   Imagen 3: ${hasImagen ? '✅ disponível' : '⚠️  não encontrado'}`);
    console.log(`   Gemini:   ${hasGemini ? '✅ disponível' : '⚠️  não encontrado'}`);

    // Passo 2: testar geração real com Imagen 4
    if (hasImagen) {
      console.log('\n🎨 Testando geração de imagem (Imagen 4)...');
      const imgUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`;
      const imgRes = await fetch(imgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: 'a simple red circle on white background, minimal' }],
          parameters: { sampleCount: 1 }
        })
      });
      const imgText = await imgRes.text();
      let imgData = {};
      try { imgData = JSON.parse(imgText); } catch { /* resposta não-JSON */ }

      const hasPredictions = Array.isArray(imgData.predictions) && imgData.predictions.length > 0;
      const hasImageBytes = hasPredictions && imgData.predictions[0]?.bytesBase64Encoded?.length > 100;

      if (imgRes.ok && hasImageBytes) {
        console.log('✅ Imagen 4 gerando imagens corretamente');
        process.exit(0);
      } else if (imgData.error) {
        console.warn(`⚠️  Imagen 4 retornou erro: ${imgData.error.message}`);
        console.log('   (A chave é válida mas Imagen 4 pode não estar habilitado para esta conta)');
        process.exit(2);
      } else {
        console.warn('⚠️  Imagen 4 retornou resposta inesperada');
        console.log('   Resposta parcial:', imgText.slice(0, 120));
        process.exit(2);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(`❌ Erro de conexão: ${err.message}`);
    process.exit(1);
  }
}

testAPI();

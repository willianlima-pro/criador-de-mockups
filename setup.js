#!/usr/bin/env node
/**
 * CM-Mockups — Script de instalação
 * Cria as pastas necessárias e configura a chave de API do Google.
 *
 * Uso: node setup.js
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const ROOT         = __dirname;
const CONFIG_DIR   = path.join(ROOT, '.config');
const CONFIG_FILE  = path.join(CONFIG_DIR, 'api-config.json');
const OUTPUT_DIR   = path.join(ROOT, 'Mockups Finalizados');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎨  CM-Mockups — Instalação');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Criar pastas necessárias
  [CONFIG_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Pasta criada: ${path.relative(ROOT, dir)}/`);
    } else {
      console.log(`📁 Pasta já existe: ${path.relative(ROOT, dir)}/`);
    }
  });

  console.log('');

  // 2. Verificar se já tem configuração
  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (config.google_api_key) {
      console.log('✅ Chave de API já configurada.');
      const resp = await ask('   Deseja substituir? [s/N] ');
      if (resp.toLowerCase() !== 's') {
        console.log('\n🎉 Instalação concluída! Use /cm-novo para criar seu primeiro mockup.\n');
        rl.close();
        return;
      }
    }
  }

  // 3. Solicitar chave de API
  console.log('🔑 Configuração da API Google AI Studio');
  console.log('');
  console.log('   Como obter sua chave (gratuito):');
  console.log('   1. Acesse https://aistudio.google.com/apikey');
  console.log('   2. Clique em "Create API Key"');
  console.log('   3. Copie a chave gerada (começa com "AIzaSy...")');
  console.log('');

  const key = await ask('   Cole sua chave aqui: ');
  rl.close();

  if (!key || !key.startsWith('AIza')) {
    console.log('\n⚠️  Chave inválida. Execute novamente e cole a chave correta.');
    process.exit(1);
  }

  // 4. Salvar e testar
  execSync(`node "${path.join(ROOT, '.scripts', 'manage-config.js')}" set-key ${key}`, { stdio: 'inherit' });

  console.log('\n🧪 Testando chave...');
  try {
    execSync(`node "${path.join(ROOT, '.scripts', 'test-google-api.js')}" ${key}`, { stdio: 'inherit' });
    execSync(`node "${path.join(ROOT, '.scripts', 'manage-config.js')}" mark-tested ok`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎉  Instalação concluída com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('  Abra o Claude Code nesta pasta e use:');
    console.log('  /cm-novo    → criar mockup');
    console.log('  /cm-editar  → editar imagem gerada');
    console.log('  /cm-help    → ajuda completa');
    console.log('');
  } catch (e) {
    const code = e.status;
    execSync(`node "${path.join(ROOT, '.scripts', 'manage-config.js')}" mark-tested ${code === 2 ? 'parcial' : 'falhou'}`);
    if (code === 2) {
      console.log('\n⚠️  Chave válida, mas Imagen não habilitado nesta conta.');
      console.log('   Acesse https://aistudio.google.com e aceite os termos do Imagen.');
      console.log('   Você ainda pode gerar prompts com /cm-novo → opção [2].');
    } else {
      console.log('\n❌ Chave inválida. Verifique em https://aistudio.google.com/apikey');
    }
  }
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});

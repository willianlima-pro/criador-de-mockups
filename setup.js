#!/usr/bin/env node
/**
 * CM-Mockups — Script de instalação
 * Cria as pastas necessárias, pergunta qual ferramenta o usuário usa
 * e configura a chave de API do Google.
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

// ─── Instruções por ferramenta ────────────────────────────────────────────────
const TOOL_INSTRUCTIONS = {
  '1': {
    name: 'Claude Code',
    start: 'Abra o Claude Code nesta pasta com o comando:',
    cmd: '  claude',
    commands: [
      '  /cm-novo    → criar mockup',
      '  /cm-editar  → editar imagem gerada',
      '  /cm-config  → configurar API',
      '  /cm-help    → ajuda completa',
    ],
    note: 'Os comandos são carregados automaticamente pela pasta .claude/commands/',
  },
  '2': {
    name: 'Gemini CLI (Google Antigravity / Firebase Studio)',
    start: 'Abra o Gemini CLI nesta pasta com o comando:',
    cmd: '  gemini',
    commands: [
      '  /cm-novo    → criar mockup',
      '  /cm-editar  → editar imagem gerada',
      '  /cm-config  → configurar API',
      '  /cm-help    → ajuda completa',
    ],
    note: 'Use o arquivo GEMINI.md como contexto do sistema ao iniciar o Gemini CLI.',
  },
  '3': {
    name: 'Codex CLI (OpenAI)',
    start: 'Abra o Codex CLI nesta pasta com o comando:',
    cmd: '  codex',
    commands: [
      '  /cm-novo    → criar mockup',
      '  /cm-editar  → editar imagem gerada',
      '  /cm-config  → configurar API',
      '  /cm-help    → ajuda completa',
    ],
    note: 'Use o arquivo AGENTS.md como contexto do sistema ao iniciar o Codex CLI.',
  },
};

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎨  CM-Mockups — Instalação');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Selecionar ferramenta
  console.log('Qual ferramenta de IA você usa?\n');
  console.log('  [1] Claude Code       (Recomendado)');
  console.log('  [2] Google Antigravity / Gemini CLI');
  console.log('  [3] Codex CLI (OpenAI)');
  console.log('');

  let toolChoice = '';
  while (!['1', '2', '3'].includes(toolChoice)) {
    toolChoice = (await ask('  Digite o número da opção: ')).trim();
    if (!['1', '2', '3'].includes(toolChoice)) {
      console.log('  ⚠️  Opção inválida. Digite 1, 2 ou 3.');
    }
  }

  const tool = TOOL_INSTRUCTIONS[toolChoice];
  console.log(`\n✅ Configurando para: ${tool.name}\n`);

  // 2. Criar pastas necessárias
  [CONFIG_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Pasta criada: ${path.relative(ROOT, dir)}/`);
    } else {
      console.log(`📁 Pasta já existe: ${path.relative(ROOT, dir)}/`);
    }
  });

  console.log('');

  // 3. Verificar se já tem configuração
  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (config.google_api_key) {
      console.log('✅ Chave de API já configurada.');
      const resp = await ask('   Deseja substituir? [s/N] ');
      if (resp.toLowerCase() !== 's') {
        showFinalMessage(tool);
        rl.close();
        return;
      }
    }
  }

  // 4. Solicitar chave de API
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

  // 5. Salvar e testar
  execSync(`node "${path.join(ROOT, '.scripts', 'manage-config.js')}" set-key ${key}`, { stdio: 'inherit' });

  console.log('\n🧪 Testando chave...');
  try {
    execSync(`node "${path.join(ROOT, '.scripts', 'test-google-api.js')}" ${key}`, { stdio: 'inherit' });
    execSync(`node "${path.join(ROOT, '.scripts', 'manage-config.js')}" mark-tested ok`);
    showFinalMessage(tool, true);
  } catch (e) {
    const code = e.status;
    execSync(`node "${path.join(ROOT, '.scripts', 'manage-config.js')}" mark-tested ${code === 2 ? 'parcial' : 'falhou'}`);
    if (code === 2) {
      console.log('\n⚠️  Chave válida, mas Imagen não habilitado nesta conta.');
      console.log('   Acesse https://aistudio.google.com e aceite os termos do Imagen.');
      console.log('   Você ainda pode gerar prompts com /cm-novo → opção [2].');
      showFinalMessage(tool, false);
    } else {
      console.log('\n❌ Chave inválida. Verifique em https://aistudio.google.com/apikey');
    }
  }
}

function showFinalMessage(tool, apiOk = true) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (apiOk !== false) {
    console.log('  🎉  Instalação concluída com sucesso!');
  } else {
    console.log('  ✅  Instalação concluída (modo prompt apenas)');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  ${tool.start}`);
  console.log(`\n${tool.cmd}\n`);
  console.log('  Comandos disponíveis:');
  tool.commands.forEach(c => console.log(c));
  console.log(`\n  💡 ${tool.note}`);
  console.log('');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});

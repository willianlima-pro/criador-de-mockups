#!/usr/bin/env node
/**
 * Gerencia a configuração da skill CM-Mockups.
 *
 * Uso:
 *   node manage-config.js status
 *   node manage-config.js get <campo>
 *   node manage-config.js set <campo> <valor>
 *   node manage-config.js set-key <API_KEY>
 *   node manage-config.js clear
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', '.config');
const CONFIG_PATH = path.join(CONFIG_DIR, 'api-config.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function maskKey(key) {
  if (!key || key.length < 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

const [, , action, ...rest] = process.argv;

switch (action) {
  case 'status': {
    const c = loadConfig();
    if (c.google_api_key) {
      console.log('✅ Configurado');
      console.log(`   Chave: ${maskKey(c.google_api_key)}`);
      console.log(`   Status: ${c.test_status || 'não testado'}`);
      console.log(`   Última atualização: ${c.updated_at || 'desconhecido'}`);
    } else {
      console.log('❌ Não configurado — chave de API ausente');
    }
    break;
  }

  case 'get': {
    const c = loadConfig();
    const field = rest[0];
    if (!field) {
      console.log(JSON.stringify(c, null, 2));
    } else {
      const val = field === 'google_api_key' ? maskKey(c[field]) : c[field];
      console.log(val !== undefined ? val : '');
    }
    break;
  }

  case 'get-raw': {
    const c = loadConfig();
    console.log(c[rest[0]] || '');
    break;
  }

  case 'set': {
    const [field, value] = rest;
    if (!field || value === undefined) {
      console.error('Uso: set <campo> <valor>');
      process.exit(1);
    }
    const c = loadConfig();
    c[field] = value;
    c.updated_at = new Date().toISOString();
    saveConfig(c);
    console.log(`✅ ${field} atualizado`);
    break;
  }

  case 'set-key': {
    const key = rest[0];
    if (!key) {
      console.error('Uso: set-key <API_KEY>');
      process.exit(1);
    }
    const c = loadConfig();
    c.google_api_key = key;
    c.test_status = 'pendente';
    c.updated_at = new Date().toISOString();
    saveConfig(c);
    console.log(`✅ Chave salva: ${maskKey(key)}`);
    break;
  }

  case 'mark-tested': {
    const status = rest[0] || 'ok';
    const c = loadConfig();
    c.test_status = status;
    c.last_tested = new Date().toISOString();
    saveConfig(c);
    console.log(`✅ Status atualizado: ${status}`);
    break;
  }

  case 'clear': {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
      console.log('✅ Configuração removida');
    } else {
      console.log('Nenhuma configuração encontrada');
    }
    break;
  }

  default:
    console.error('Ação inválida. Use: status | get | set | set-key | mark-tested | clear');
    process.exit(1);
}

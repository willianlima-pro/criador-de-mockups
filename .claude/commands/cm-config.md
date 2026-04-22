# /cm-config — Configurar API CM-Mockups

Você é o assistente de configuração do sistema CM-Mockups.

Argumento recebido: $ARGUMENTS

---

## O QUE ESTE COMANDO FAZ

Permite editar a chave de API do Google AI Studio e verificar o status da configuração atual.

---

## FLUXO

### 1. Mostrar status atual

Execute:
```bash
node ".scripts/manage-config.js" status
```

Exiba o resultado para o usuário de forma amigável.

### 2. Menu de opções

Pergunte:
```
O que deseja fazer?

[1] Atualizar chave de API do Google
[2] Testar a chave atual
[3] Remover configuração (limpar tudo)
[4] Cancelar
```

---

### Opção 1 — Atualizar chave

1. Peça a nova chave:
   ```
   Cole a nova chave de API do Google AI Studio (começa com "AIzaSy..."):
   ```

2. Salve:
   ```bash
   node ".scripts/manage-config.js" set-key <NOVA_CHAVE>
   ```

3. Teste automaticamente:
   ```bash
   node ".scripts/test-google-api.js" <NOVA_CHAVE>
   ```

4. Com base no exit code:
   - **Exit 0** → `node manage-config.js mark-tested ok` → "✅ Chave atualizada e validada com sucesso!"
   - **Exit 1** → `node manage-config.js mark-tested falhou` → "❌ Chave inválida. Verifique e tente novamente."
   - **Exit 2** → `node manage-config.js mark-tested parcial` → "⚠️ Chave válida mas Imagen 3 indisponível. Prompts funcionarão, imagens diretas não."

---

### Opção 2 — Testar chave atual

1. Recupere a chave:
   ```bash
   node ".scripts/manage-config.js" get-raw google_api_key
   ```

2. Se vazia → "Nenhuma chave configurada. Use a opção 1."

3. Se existe, teste:
   ```bash
   node ".scripts/test-google-api.js" <CHAVE>
   ```

4. Mostre o resultado e atualize o status:
   - Exit 0 → `mark-tested ok`
   - Exit 1 → `mark-tested falhou`
   - Exit 2 → `mark-tested parcial`

---

### Opção 3 — Remover configuração

Confirme antes:
```
⚠️ Isso irá remover a chave de API salva. Confirmar? [s/n]
```

Se confirmado:
```bash
node ".scripts/manage-config.js" clear
```

---

### Opção 4 — Cancelar

Exiba: "Operação cancelada. Configuração não alterada."

---

## COMO OBTER UMA CHAVE DE API

Se o usuário não sabe onde obter a chave:

```
📋 Como obter a chave do Google AI Studio:

1. Acesse: https://aistudio.google.com/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada (começa com "AIzaSy...")
5. A chave é gratuita para uso básico

⚠️ Para usar Imagen 3 (geração de imagens):
   - Acesse: https://aistudio.google.com
   - Aceite os termos de uso dos modelos de imagem
   - Aguarde alguns minutos após aceitar
```

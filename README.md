# 🎨 CM-Mockups — Criador de Mockups para Claude Code

Skill para **Claude Code** que transforma o seu rótulo ou arte em um mockup fotorrealista de produto em **resolução 2K (2400×1792px)** diretamente no terminal.

Funciona com **Google Gemini 3.1 Flash Image Preview** — o rótulo é enviado direto para a API, sem ser analisado ou reinterpretado. O resultado é um mockup de estúdio profissional com o seu design exato aplicado.

---

## ✨ O que você consegue fazer

| Entrada | O que acontece |
|--------|----------------|
| Rótulo (PNG/JPG) | Mockup 3D fotorrealista 2K gerado automaticamente |
| Rótulo + referência de estilo | Mockup no formato da referência com seu rótulo |
| Apenas descrição | Prompt profissional pronto para o Google Flow Labs |
| Mockup já gerado | Edição com instrução livre ("fundo escuro", "cápsulas brancas"…) |

---

## 📋 Requisitos

- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- **Claude Code** → `npm install -g @anthropic-ai/claude-code`
- **Chave de API Google AI Studio** → gratuita em [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Python 3 + Pillow** *(opcional — usado só como fallback de upscale)*

```bash
pip3 install Pillow
```

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/willianlima-pro/criador-de-mockups.git
cd criador-de-mockups
```

### 2. Execute o setup

```bash
node setup.js
```

O setup vai:
- ✅ Criar as pastas `config/` e `Mockups Finalizados/` automaticamente
- ✅ Solicitar sua chave de API do Google
- ✅ Testar a chave e confirmar que está funcionando

### 3. Abra o Claude Code na pasta do projeto

```bash
claude
```

Pronto. Os comandos já estão disponíveis.

---

## 🛠️ Comandos

### `/cm-novo` — Criar mockup

```
/cm-novo crie um mockup do produto encapsulado
```

O assistente vai guiar você pelo processo:

1. Escolha o modo: **gerar imagem** ou **gerar prompt**
2. Envie o seu rótulo (PNG/JPG)
3. Envie uma referência de estilo se quiser *(ex: foto de frasco transparente)*
4. O mockup é gerado, salvo em `Mockups Finalizados/` e aberto automaticamente
5. Na sequência, você pode editar a imagem com uma instrução simples

**Atalhos diretos:**
```
/cm-novo [descrição] --image    → pula para geração de imagem
/cm-novo [descrição] --prompt   → pula para geração de prompt
```

---

### `/cm-editar` — Editar um mockup gerado

```
/cm-editar
```

Lista os mockups recentes e aplica qualquer modificação:

```
💡 Exemplos de instrução:
• "fundo escuro de mármore preto"
• "trocar as cápsulas por brancas"
• "iluminação mais dramática"
• "remover todos os props, só o produto"
• "adicionar reflexo no chão tipo espelho"
```

Você pode iterar quantas vezes quiser sobre a mesma imagem.

---

### `/cm-edit` — Configurar ou trocar a chave de API

```
/cm-edit
```

Opções:
- Atualizar chave de API
- Testar a chave atual
- Remover configuração

---

### `/cm-help` — Ajuda completa

```
/cm-help
```

---

## 🏗️ Como funciona por baixo

O diferencial desta skill é **nunca descrever o rótulo no prompt**. A arte é enviada direto para a API como dado binário:

```
Seu rótulo (PNG/JPG) ──────────────────────→ API (inline_data)
Prompt da cena       → só descreve embalagem e cena → API
                                                       ↓
                                          Mockup com o seu rótulo exato
```

Isso elimina erros de texto, distorções tipográficas e alucinações do modelo. O rótulo sai idêntico ao original.

---

## 📁 Estrutura do projeto

```
criador-de-mockups/
├── 📂 .claude/commands/
│   ├── cm-novo.md        ← /cm-novo
│   ├── cm-editar.md      ← /cm-editar
│   ├── cm-edit.md        ← /cm-edit
│   └── cm-help.md        ← /cm-help
├── 📂 scripts/
│   ├── generate-with-reference.js  ← geração com rótulo
│   ├── generate-image.js           ← geração sem referência
│   ├── edit-image.js               ← edição de imagem
│   ├── manage-config.js            ← gerenciar chave de API
│   ├── test-google-api.js          ← testar chave
│   └── upscale-2k.py               ← upscale fallback (PIL)
├── 📂 config/
│   └── api-config.json   ← criado pelo setup (não vai para o git)
├── 📂 Mockups Finalizados/
│   └── ...               ← suas imagens geradas (não vão para o git)
├── agente-mockups.md     ← referência de props e prompts por nicho
├── setup.js              ← 🔧 instalar e configurar
├── package.json
└── README.md
```

---

## 🎯 Nichos suportados

Props e superfícies otimizados para cada nicho:

| Nicho | Superfície padrão |
|-------|------------------|
| 💊 Suplementos / Encapsulados | Branco infinito |
| 🏥 Farmácia / Manipulados | Branco clean |
| 💆 Dermocosméticos / Skincare | Mármore branco |
| 🧬 Biohacking / Longevidade | Ardósia escura |
| 🌿 Fitoterápicos / Orgânicos | Madeira natural |
| 💪 Nutrição Esportiva | Branco infinito |
| 💰 Finanças / Investimentos | Madeira escura |
| 📚 Infoprodutos / Educação | Branco gradiente |

---

## 🔧 Resolução de problemas

| Problema | Solução |
|----------|---------|
| `❌ Não configurado` | Rode `node setup.js` ou `node scripts/manage-config.js set-key SUA_CHAVE` |
| Chave inválida | Verifique em [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Imagen não habilitado | Acesse [aistudio.google.com](https://aistudio.google.com) e aceite os termos do Imagen |
| Limite de uso atingido | Atualize o spending cap em [aistudio.google.com/spend](https://aistudio.google.com/spend) |
| Imagem com resolução baixa | Instale Pillow: `pip3 install Pillow` |

---

## 👤 Autor

**Willian Lima**

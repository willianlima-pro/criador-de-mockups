# 🎨 CM-Mockups — Criador de Mockups com IA

Skill para **Claude Code**, **Gemini CLI** e **Codex CLI** que transforma o seu rótulo ou arte em um mockup fotorrealista de produto em **resolução 2K (2400×1792px)** diretamente no terminal.

Funciona com **Google Gemini 3.1 Flash Image Preview** — o rótulo é enviado direto para a API como dado binário, sem ser descrito nem reinterpretado. O resultado é um mockup de estúdio profissional com o seu design exato aplicado.

---

## ✨ O que você consegue fazer

| Entrada | O que acontece |
|---------|----------------|
| Rótulo (PNG/JPG) | Mockup 3D fotorrealista 2K gerado automaticamente |
| Rótulo + referência de estilo | Mockup no formato da referência com seu rótulo |
| Apenas descrição | Prompt profissional pronto para o Google Flow Labs |
| Mockup já gerado | Edição com instrução livre ("fundo escuro", "cápsulas brancas"…) |

---

## 🖼️ Mockups que você consegue criar

### Produtos Físicos — Saúde & Bem-estar
| Tipo de embalagem | Exemplos |
|-------------------|---------|
| 💊 Frasco HDPE cilíndrico | Suplementos, vitaminas, termogênicos, whey |
| 🫙 Pote wide-mouth | Creatina, proteína em pó, colágeno |
| 💉 Ampola de vidro | Soros, vitamina C injetável, ácido hialurônico |
| 📦 Blister cartonado | Cápsulas individuais, comprimidos, gomas |
| 🧴 Bisnaga / Tubo | Cremes, pomadas, géis, pastas |
| 🍬 Sachê doy-pack | Colágeno solúvel, chás, suplementos em pó |
| 🫧 Frasco pump/airless | Sérum, fluido, vitamina C facial |
| 💧 Frasco conta-gotas | Tinturas, óleos essenciais, CBD |

### Produtos Físicos — Beleza & Skincare
| Tipo de embalagem | Exemplos |
|-------------------|---------|
| 🏺 Pote de vidro | Creme facial premium, máscara capilar |
| 🧴 Frasco loção | Hidratante corporal, protetor solar |
| 💄 Stick / Batom | Protetor labial, base bastão |
| 🧪 Refil cartonado | Perfume, skincare eco-friendly |
| 🪙 Lata alumínio | Desodorante, pasta dental natural |

### Produtos Físicos — Alimentos & Bebidas
| Tipo de embalagem | Exemplos |
|-------------------|---------|
| 🫙 Pote rosca | Mel, pasta de amendoim, proteína |
| 🧃 Caixinha tetra | Bebida vegetal, suco funcional |
| 🍫 Embalagem flow-pack | Barra de proteína, snack |
| 🥤 Lata bebida | Energético, pré-treino líquido, RTD |
| 🫙 Pote pop-top | Grãos, mix de castanhas, granola |

### Infoprodutos & Digitais
| Tipo | Exemplos |
|------|---------|
| 📚 Ebook (capa 3D) | Livros digitais, guias, manuais |
| 💻 Software box | Cursos, ferramentas, SaaS |
| 📱 App mockup | Aplicativos mobile em device |
| 📋 Planilha / Template | Ferramentas digitais |
| 🎓 Certificado / Diploma | Programas educacionais |
| 🗂️ Kit digital | Bundle de produtos digitais |

---

## 💬 Exemplos de prompts

### Exemplo 1 — Suplemento encapsulado

```
/cm-novo frasco de suplemento HDPE 60 cápsulas, nicho de saúde --image
```

**Prompt gerado pela IA (enviado ao Gemini):**
```
Product hero: cylindrical HDPE bottle 300ml, white soft-touch matte finish,
with the provided label artwork applied to the surface.
Props: amber glass dropper bottle, loose white capsules scattered,
mortar and pestle, dried botanical herbs, wooden measuring spoon.
Surface: white infinity curve, light oak wood accent panel.
Lighting: soft key light from upper-left, subtle rim light right side,
shallow depth of field, professional studio photography.
Style: high-end pharmaceutical editorial, photorealistic 8K render.
```

---

### Exemplo 2 — Ebook de finanças

```
/cm-novo ebook de finanças pessoais, investimentos, tema escuro --prompt
```

**Saída para o Google Flow Labs:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PROMPT — Cole no Google Flow Labs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3D rendered digital ebook mockup, hardcover floating at 30° angle.
With the provided cover artwork applied to the front face.
Props: scattered gold coins, minimalist calculator, fountain pen on dark
obsidian surface. Background: dark charcoal gradient with subtle bokeh.
Lighting: dramatic spotlight from above, gold rim light, financial elegance.
Style: luxury editorial photography, photorealistic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 NEGATIVE PROMPT — Cole no campo negativo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

blurry, low resolution, plastic look, toy, cartoon, flat, 2D,
bad lighting, overexposed, text on background, watermark

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 COMO USAR NO FLOW LABS:
  1. Acesse https://flow.google ou https://labs.google/fx/tools/whisk
  2. Suba sua capa como IMAGE REFERENCE
  3. Cole o PROMPT no campo de texto
  4. Cole o NEGATIVE PROMPT no campo negativo
  5. Gere o mockup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Exemplo 3 — Skincare premium com referência de estilo

```
/cm-novo frasco sérum vitamina C, skincare premium, duas referências --image
```

O sistema pede duas imagens: a referência de **estilo** (formato do frasco) e o **rótulo** (sua arte). Ambas são enviadas juntas à API — o rótulo sai idêntico aplicado no formato exato da referência.

---

## 📋 Requisitos

- **Node.js 18+** → [nodejs.org](https://nodejs.org)
- **Ferramenta de IA** → Claude Code, Gemini CLI ou Codex CLI (escolhida no setup)
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
- ✅ Perguntar qual ferramenta você usa (Claude Code, Gemini CLI ou Codex)
- ✅ Criar a pasta `Mockups Finalizados/` automaticamente
- ✅ Solicitar sua chave de API do Google
- ✅ Testar a chave e confirmar que está funcionando
- ✅ Mostrar como ativar os comandos na sua ferramenta

### 3. Abra sua ferramenta na pasta do projeto

| Ferramenta | Comando |
|-----------|---------|
| Claude Code | `claude` |
| Gemini CLI | `gemini` (com `GEMINI.md` como contexto) |
| Codex CLI | `codex` (com `AGENTS.md` como contexto) |

Pronto. Os comandos já estão disponíveis.

---

## 🛠️ Comandos

### `/cm-novo` — Criar mockup

```
/cm-novo crie um mockup de frasco de suplemento encapsulado
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

Lista os mockups recentes em `Mockups Finalizados/` e aplica qualquer modificação:

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

### `/cm-config` — Configurar ou trocar a chave de API

```
/cm-config
```

Opções:
- Ver status da configuração atual
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
├── 📂 .claude/commands/      ← comandos para Claude Code
│   ├── cm-novo.md              /cm-novo
│   ├── cm-editar.md            /cm-editar
│   ├── cm-config.md            /cm-config
│   └── cm-help.md              /cm-help
├── 📂 .gemini/commands/      ← comandos para Gemini CLI
│   ├── cm-novo.md
│   ├── cm-editar.md
│   ├── cm-config.md
│   └── cm-help.md
├── 📂 .agents/                ← comandos para Codex CLI
│   ├── cm-novo.md
│   ├── cm-editar.md
│   ├── cm-config.md
│   └── cm-help.md
├── 📂 Mockups Finalizados/   ← suas imagens geradas (não vão para o git)
├── GEMINI.md                 ← contexto para Gemini CLI
├── AGENTS.md                 ← contexto para Codex CLI
├── setup.js                  ← 🔧 instalar e configurar
├── package.json
└── README.md
```

> As pastas `.scripts/` e `.config/` são criadas pelo setup e ficam ocultas — você não precisa mexer nelas.

---

## 🔧 Resolução de problemas

| Problema | Solução |
|----------|---------|
| `❌ Não configurado` | Rode `node setup.js` novamente |
| Chave inválida | Verifique em [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Imagen não habilitado | Acesse [aistudio.google.com](https://aistudio.google.com) e aceite os termos do Imagen |
| Limite de uso atingido | Atualize o spending cap em [aistudio.google.com/spend](https://aistudio.google.com/spend) |
| Imagem com resolução baixa | Instale Pillow: `pip3 install Pillow` |

---

## 👤 Autor

**Willian Lima**

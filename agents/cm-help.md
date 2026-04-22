# /cm-help — Ajuda do Sistema CM-Mockups

Exiba as informações abaixo de forma clara e organizada para o usuário.

---

## O QUE EXIBIR

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨  CM-MOCKUPS — Sistema de Criação de Mockups Premium
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMANDOS DISPONÍVEIS:

  /cm-novo   → Criar um novo mockup
  /cm-edit   → Editar configurações (chave de API)
  /cm-help   → Exibir esta ajuda

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌  COMO USAR O /cm-novo

  Exemplos:
    /cm-novo frasco de suplemento esportivo, modo imagem
    /cm-novo ebook de finanças pessoais --prompt
    /cm-novo pote de skincare premium --image

  Modos disponíveis:
    --image  (-i)  → Gera a imagem diretamente
    --prompt (-p)  → Gera prompt para o Google Flow Labs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄  FLUXO COM IMAGEM DE REFERÊNCIA

  1. Use /cm-novo e descreva o produto
  2. Quando solicitado, envie a imagem do rótulo/capa
  3. O sistema detecta o tipo, nicho e acabamentos
  4. Gera o prompt ideal OU a imagem diretamente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯  MODOS DE SAÍDA

  MODO IMAGEM:
  • Usa Google Imagen 3 via API para gerar automaticamente
  • Requer chave de API do Google AI Studio configurada
  • Imagem salva em: "Mockups Finalizados/"
  • Se não tiver referência: usa nano-banana

  MODO PROMPT:
  • Gera prompt profissional para colar no Google Flow Labs
  • Não requer configuração de API
  • Inclui PROMPT + NEGATIVE PROMPT prontos para uso
  • Prompt salvo em: "Mockups Finalizados/"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  CONFIGURAÇÃO DA API

  Para modo imagem, configure a API do Google:
    1. Acesse: https://aistudio.google.com/apikey
    2. Crie uma chave de API
    3. Execute /cm-novo e forneça a chave quando solicitado
       OU execute /cm-edit para configurar manualmente

  A chave é salva localmente em: config/api-config.json
  Para alterar a chave: /cm-edit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦  PRODUTOS SUPORTADOS

  Físicos: Frascos HDPE/PET, Vidro âmbar, Potes wide-mouth,
           Blisters, Sachês, Bisnagas, Ampolas, Caixas cartonadas

  Digitais: Software box, Ebook, Curso online, App mockup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁  ARQUIVOS GERADOS

  Mockups Finalizados/
  ├── mockup-YYYYMMDD-HHMMSS.png   (imagens geradas)
  └── prompt-YYYYMMDD-HHMMSS.txt   (prompts gerados)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Após exibir o help, pergunte se o usuário quer criar um mockup agora:
```
Pronto para criar um mockup? Use /cm-novo ou descreva o que deseja aqui.
```

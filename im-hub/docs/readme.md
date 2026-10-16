# PTG Tanques

Sistema web de controle de estoque de tanques, IBCs e bombonas de produtos químicos.

## Problema

O estoque vive em planilha e depende de conferência manual. O PTG Tanques deixa o operador registrar entradas e saídas direto pelo nível medido (em cm) e dá à gestão uma visão consolidada de ocupação e produtos sem estoque.

## O que foi construído

- **Início:** seleção do produto, grade de tanques com ocupação e capacidade, IBCs e bombonas. O operador informa o nível em cm e registra **entrada** ou **saída**; as variações do tanque são configuráveis.
- **Dashboard:** KPIs (produtos, tanques, IBCs/BBs, capacidade total, estoque atual e ocupação global), alerta de produtos com estoque zero, filtros por produto, status, tipo e material, abas de produtos, tanques e percepções (insights automáticos).
- **Dados na planilha:** leitura e escrita pela Google Sheets API com login Google (OAuth), com atualização silenciosa a cada 15 s.
- Tema escuro único, seguindo um guia de identidade visual próprio.

## Como rodar

Requisitos: Node.js 22.18+ ou 24.12+.

```bash
npm install
npm run dev      # modo dev usa dados de exemplo, sem login
npm run build    # build de produção
```

Para produção, copie `.env.example` para `.env` e preencha `VITE_GOOGLE_CLIENT_ID` e `VITE_GOOGLE_SPREADSHEET_ID` (no Netlify, as mesmas chaves em Environment).

## Próximos passos

- Autenticação silenciosa: restaurar o token ao abrir e usar popup apenas como fallback.
- Publicar a tela de consentimento OAuth em modo Production.

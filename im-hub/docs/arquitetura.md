# Arquitetura

## Stack

Vue 3, Vite, Tailwind CSS 4 e Vue Router. Hospedagem no Netlify, com fallback de SPA para `index.html`. Qualidade: ESLint, oxlint e Prettier.

## Fluxo

1. O usuário entra com a conta Google (Google Identity Services); o token fica no `localStorage`.
2. `sheetsapi.js` lê e escreve na planilha pela Google Sheets API, com nova tentativa automática em caso de 401.
3. Um parser único (`parseTankRow` e equivalentes) converte as linhas das abas de tanques, IBCs e bombonas em objetos usados pelo Início e pelo Dashboard.
4. O Dashboard recarrega os dados a cada 15 s de forma silenciosa.

## Organização de `src/`

| Caminho | Responsabilidade |
|---|---|
| `components/HomePage.vue`, `ProductsPanel.vue`, `ControlsPanel.vue`, `VisualizationPanel.vue` | tela de operação (produto, controle de nível, visualização) |
| `components/DashboardPage.vue` | KPIs, filtros, abas e insights |
| `components/composables/session.js` | login Google e token |
| `components/composables/sheetsapi.js` | acesso à planilha e parser compartilhado |
| `components/composables/useHomePage/` | estado, regras de entrada/saída, formatação e tema |
| `router/index.js` | rotas `/home` e `/dash` protegidas por autenticação |

## Decisões

- **Planilha como fonte de dados:** sem back-end próprio; o Google Sheets continua editável pela operação.
- **Parser compartilhado:** Início e Dashboard usam a mesma leitura das linhas, evitando divergência de regras.
- **Capacidade real:** em tanques inox, a capacidade usa um fator de conversão por tanque.
- **Mock só em dev:** os dados de exemplo são carregados dinamicamente apenas no modo de desenvolvimento e não entram no bundle de produção.
- **Segredos fora do repositório:** IDs vêm de variáveis de ambiente.

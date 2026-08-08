# Styleguide de Identidade Visual — Padrão de Marca

> **Aplica-se a:** todos os produtos/dashboards da marca, em qualquer projeto ou cliente.  
> **Não define:** layout, grid, composição de telas ou componentes — cada projeto resolve os seus.  
> **Define:** como qualquer tela nossa deve *parecer*. Se um print não for reconhecível como nosso, algo violou este guia.  
> **Locale padrão:** pt-BR · **Tema:** dark único (não há variante light).

---

## 1. Essência

**“Fundo silencioso, dado colorido, voz humana em itálico.”**

1. **Neutro por padrão, cor por significado.** Superfícies vivem numa escala de cinza escuro; cor saturada existe apenas onde há *dado* ou *estado*.
2. **Itálico bold é a voz da marca.** Títulos de bloco, rótulos e anotações de gráfico falam em *itálico bold* — nossa assinatura tipográfica.
3. **Suave e arredondado.** Cantos generosos, pills, arcos com pontas redondas; nenhuma borda dura, nenhum canto vivo em elementos de dado.
4. **Camadas por luz e sombra, não por linha.** Superfícies se separam clareando levemente o cinza e usando sombra suave — nunca contornos grossos.
5. **Mesma cor, mesmo significado, sempre.** Verde = dinheiro, em qualquer projeto, para sempre (§4).
6. **Marcas clientes são hóspedes.** Logo e `--brand` entram em slot próprio; a identidade da casa não muda.

---

## 2. Superfícies & neutros

Escala do mais escuro (fundo) ao mais claro (elevado). O fundo do gráfico/card é sempre um cinza “um tom acima” da página.

| Papel | Token | Default |
|---|---|---|
| Fundo de página | `surface.app` | `#222222` |
| Controles/inputs | `surface.control` | `#2A2D2E` |
| Badges de ícone | `surface.badge` | `#2F3233` |
| Cards/painéis | `surface.panel` | `#3A3E40` |
| Elevado (pills, hover) | `surface.raised` | `#4A4E50` |
| Trilhos neutros | `chart.track` | `#4D5154` |
| Divisórias (1 px, raras) | `border.divider` | `#565A5C` |
| Bordas discretas / teto de gridline | `border.subtle` | `#4A4E50` |

**Elevação:** 3 níveis apenas — `app → panel → raised`. Efeito “emboss” (sombra interna) é aceitável em pills/valores.

---

## 3. Texto

| Papel | Token | Default |
|---|---|---|
| Primário (títulos, valores) | `text.primary` | `#FFFFFF` |
| Secundário (controles) | `text.secondary` | `#E0E0E0` |
| Terciário/desabilitado | `text.muted` | `#A6ABAD` |
| Cabeçalhos de colunas/tabular | `text.heading` | `#E6B42A` (dourado) |
| Destaque pontual (ex.: % central) | `text.highlight` | `#FFC107` |

**Stack:** `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`

### 3.1 As três vozes
| Voz | Tratamento | Onde |
|---|---|---|
| **Anotação** | *itálico bold* | Títulos de bloco, rótulos, meta (“Atualizado”), data-labels |
| **Nomeação** | UPPER, peso 400–700 | Títulos de página, nomes próprios, legendas, categorias |
| **Dado** | romano, 400–500 | Valores, células, controles |

### 3.2 Escala
`xs 12 · sm 13 · base 15 · md 16 · lg 22 · xl 26 · 2xl 40` (px).  
Peso mínimo 400 (thin desaparece no dark). Dourado (`text.heading`) só em cabeçalhos tabulares; amarelo `highlight` só em destaque único por bloco.

---

## 4. Cor de dado (semântica fixa da marca)

| Significado | Token | Default |
|---|---|---|
| Monetário / receita | `data.money` | `#1ED71E` |
| Volume / quantidade física | `data.volume` | `#2E86F0` |
| Ocorrências / documentos / atenção | `data.count` | `#FFB300` |
| Projeção / meta | `data.forecast` | `#B44FD8` |
| Período comparativo / 2ª métrica | `data.period` | `#22C3DC` |
| Série principal de barras | `data.series` | `#FF8A00` |
| Ranking (par alternado) | `data.rank-a` / `data.rank-b` | `#6C1D9E` / `#00E626` |
| Alta ▲ / Baixa ▼ | `data.up` / `data.down` | `#1ED71E` / `#D32F2F` |

- **Não se escolhe cor de dado por estética.** Mapeia-se o significado e usa-se o token.
- Linha temporal default: `chart.line` `#4C8DF5`.

### 4.1 Categórica (segmentos)
Ordem fixa: `#1FCE1F → #2196F3 → #D32F2F → #FFC107 → #000000 → #E6C35C → #F48FB1 → #7986CB`  
Máx. 8; excedente vira “Outros” em `surface.raised`.

---

## 5. Forma & elevação

Vocabulário de formas da marca (independente do componente que as usa):

| Forma | Raio | Sombra | Onde aparece |
|---|---|---|---|
| Painel | 14 px | `0 4px 10px rgba(0,0,0,.35)` | Cards, blocos |
| Controle | 8 px | leve `0 2px 4px rgba(0,0,0,.4)` | Selects, botões, inputs |
| Pill | 999 px | emboss (interna) | Valores, chips |
| Badge circular | 50% | — | Ícones |
| Barra/micro-progresso | 3 px | — | Indicadores inline |
| Moldura de logo | 16 px | — | Slot de marca |

Bordas: no máx. 1 px e sempre discretas (`border.subtle`). Separação visual vem de superfície + sombra.

**Spacing:** ritmo base 4 → 8 / 12 / 16 / 20 / 24 / 32. Respiração generosa entre blocos; nada colado.

---

## 6. Linguagem de gráficos (a cara dos dados)

- Fundo do plot = `surface.panel`; sem moldura ao redor do gráfico.
- Gridlines só horizontais, nunca mais claras que `border.subtle`.
- **Data-labels em *itálico bold***; valores grandes abreviados (`mi`/`mil`), completos só em hover/detalhe.
- Séries temporais: spline suave 2 px; área com gradiente→transparente admitida apenas em série única.
- Arcos e progressos: **pontas arredondadas**, trilho neutro, valor central em `text.highlight`.
- Barras: sem gradiente, sem 3D, sem sombra; ordenadas decrescente salvo ordem natural (tempo).
- Percentuais internos em fatias: 12 px bold branco.
- Proibido: 3D, texturas, glow neon em série, gradiente em barra, fundo quadriculado claro.

---

## 7. Ícones & marca

- Pictogramas **coloridos, estilo emoji**, 28–32 px, sobre badge circular `surface.badge`.
- Não usar ícone outline/mono em KPIs; o colorido faz parte da cara.
- Logo de cliente: sempre em moldura própria, nunca recolorido, nunca como fundo.
- `--brand` é o único token sobrescrevível por projeto (detalhes de marca, ex.: estado ativo).

---

## 8. Escrita & formatação (pt-BR)

| Tipo | Regra | Exemplo |
|---|---|---|
| Moeda | `R$ ` + milhar `.` + decimal `,` | R$ 1.234.567,89 |
| Inteiro | milhar com `.` | 3.354.084 |
| Abreviação | `mi` / `mil` minúsculos | 4,4 mi · 945,016 mil |
| Percentual | vírgula + `%` colado | 22,2% |
| Data | dd/mm/yyyy; mês por extenso minúsculo | 05/08/2026 · julho |
| Nomes/legendas | UPPER | CLIENTE A |

---

## 9. Acessibilidade (identidade também é legibilidade)

- Contraste ≥ 4.5:1 em texto `base/sm`; ≥ 3:1 em valores grandes.
- `focus-visible` com outline 2 px `data.period` em todo interativo.
- Cor nunca sozinha: significado sempre pareado com rótulo, ícone ou ▲▼.

---

## 10. Tokens (fonte da verdade)

```css
:root{
  /* primitivas */
  --n-900:#222222; --n-850:#2A2D2E; --n-800:#2F3233; --n-700:#3A3E40;
  --n-600:#4A4E50; --n-550:#4D5154; --n-500:#565A5C; --n-400:#A6ABAD;
  --n-200:#E0E0E0; --n-0:#FFFFFF;
  --a-green:#1ED71E; --a-neon:#00E626; --a-blue:#2E86F0; --a-blue-soft:#4C8DF5;
  --a-amber:#FFB300; --a-gold:#E6B42A; --a-yellow:#FFC107; --a-purple:#B44FD8;
  --a-purple-deep:#6C1D9E; --a-cyan:#22C3DC; --a-orange:#FF8A00; --a-red:#D32F2F;
  --c1:#1FCE1F; --c2:#2196F3; --c3:#D32F2F; --c4:#FFC107; --c5:#000000;
  --c6:#E6C35C; --c7:#F48FB1; --c8:#7986CB;

  /* semânticos de identidade */
  --surface-app:var(--n-900);   --surface-panel:var(--n-700);
  --surface-control:var(--n-850); --surface-raised:var(--n-600);
  --surface-badge:var(--n-800);
  --border-subtle:var(--n-600); --border-divider:var(--n-500);
  --chart-track:var(--n-550);   --chart-line:var(--a-blue-soft);
  --text-primary:var(--n-0); --text-secondary:var(--n-200); --text-muted:var(--n-400);
  --text-heading:var(--a-gold); --text-highlight:var(--a-yellow);
  --data-money:var(--a-green); --data-volume:var(--a-blue); --data-count:var(--a-amber);
  --data-forecast:var(--a-purple); --data-period:var(--a-cyan);
  --data-series:var(--a-orange); --data-rank-a:var(--a-purple-deep);
  --data-rank-b:var(--a-neon); --data-up:var(--a-green); --data-down:var(--a-red);
  --radius-sm:8px; --radius-md:14px; --radius-lg:16px; --radius-full:999px;
  --shadow-card:0 4px 10px rgba(0,0,0,.35);
  --shadow-pill:0 2px 4px rgba(0,0,0,.4), inset 0 2px 6px rgba(0,0,0,.35);
  --brand:var(--a-green); /* único token sobrescrevível por projeto */
}
```

---

## 11. Do / Don’t da marca

✅ Cinza neutro no fundo; cor só no dado/estado.  
✅ *Itálico bold* como voz de anotação; UPPER como voz de nomeação.  
✅ Cantos redondos, pills, arcos com ponta redonda.  
✅ Mesmo significado = mesma cor em qualquer projeto.  

❌ Tema claro, cantos vivos em dado, bordas grossas.  
❌ Cor de dado escolhida “porque ficou bonito”.  
❌ 3D, glow, gradiente em barra, textura de fundo.  
❌ Peso < 400, dourado fora de cabeçalho tabular.  
❌ Logo de cliente solto na tela ou recolorido.

---

**Teste do print:** embaralhe prints de projetos diferentes da marca — todos devem parecer claramente do mesmo time. Se um destoar, revise contra este guia.
<template>

  <body class="bg-app min-h-screen font-sans text-primary antialiased">
    <main class="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">

      <!-- topo -->
      <header class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-badge flex items-center justify-center text-base"
            aria-hidden="true">🛢️</span>
          <h1 class="name text-lg font-semibold">Transferência HCL</h1>
        </div>
        <p class="anno text-sm text-muted">Atualizado há 2 min</p>
      </header>

      <!-- FLEX BASE -->
      <section class="flex flex-col lg:flex-row items-stretch gap-6">

        <!-- ░ painel esquerdo -->
        <div class="flex-1 bg-panel rounded-md shadow-card p-6 flex flex-col gap-6">
          <h2 class="anno text-base text-secondary">Ordens de transferência</h2>

          <!-- DROPDOWN SEARCH -->
          <label class="flex items-center gap-2 bg-control rounded-sm shadow-ctrl px-3 py-2 cursor-text">
            <span class="text-sm" aria-hidden="true">🔍</span>
            <input id="busca" type="search" placeholder="Buscar ordem…"
              class="flex-1 min-w-0 bg-transparent text-sm text-secondary placeholder-muted outline-none" />
            <span class="text-xs text-muted" aria-hidden="true">▾</span>
          </label>

          <!-- FLEX GRID RESP -->
          <div id="chips" class="flex flex-wrap gap-2 text-sm">
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">OP
              4501</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">OP
              4502</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">OP
              4507</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">OP
              4510</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-raised shadow-ctrl text-primary hover:bg-raised border border-brand"
              aria-pressed="true">HCL 35%</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">HCL
              32%</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">TQ
              07 → 15</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">TQ
              09 → 15</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">CLIENTE
              A</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">CLIENTE
              B</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">LOTE
              2231</button>
            <button
              class="chip px-3 py-1.5 rounded-full bg-control shadow-ctrl text-secondary hover:bg-raised border border-transparent">SP
              01</button>
          </div>

          <!-- barra inferior -->
          <div class="mt-auto flex items-center justify-between gap-4 bg-control rounded-sm shadow-ctrl px-4 py-2">
            <span class="anno text-sm text-muted">Filtradas</span>
            <span class="flex-1 max-w-[120px] h-[3px] rounded-full bg-track overflow-hidden">
              <span id="barFill" class="block h-full rounded-full bg-count" style="width:100%"></span>
            </span>
            <span class="text-sm text-secondary"><span id="qtd">12</span> ordens</span>
          </div>
        </div>

        <!-- ░ painel central -->
        <div
          class="flex-1 bg-panel rounded-md shadow-card p-6 flex flex-col items-center justify-center gap-6 text-center">
          <div class="flex flex-col items-center gap-1">
            <h2 id="tankTitle" class="name text-lg font-semibold">HCL 15</h2>
            <p class="anno text-sm text-muted">ácido clorídrico 35%</p>
          </div>

          <div class="flex flex-col items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-badge flex items-center justify-center text-sm"
              aria-hidden="true">🧪</span>
            <p class="anno text-sm text-muted">volume atual</p>
            <p class="bg-raised rounded-full shadow-pill px-8 py-3 text-xl font-medium leading-none">
              <span id="vol">15.000</span> <span class="text-sm text-muted">L</span>
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3">
            <button id="btnCarrega"
              class="flex items-center gap-2 bg-control hover:bg-raised rounded-sm shadow-ctrl px-5 py-2.5 text-base font-medium text-secondary transition-colors">
              <span class="text-up text-xs" aria-hidden="true">▲</span> Carrega
            </button>
            <button id="btnDescarrega"
              class="flex items-center gap-2 bg-control hover:bg-raised rounded-sm shadow-ctrl px-5 py-2.5 text-base font-medium text-secondary transition-colors">
              <span class="text-down text-xs" aria-hidden="true">▼</span> Descarrega
            </button>
          </div>

          <p class="anno text-xs text-muted">capacidade 20.000 L</p>
        </div>

        <!-- ░ painel direito -->
        <div class="flex-1 bg-panel rounded-md shadow-card p-6 flex flex-col gap-6">
          <h2 class="anno text-base text-secondary">Nível do tanque</h2>

          <div class="flex flex-wrap items-start justify-center gap-6">
            <!-- CONDICIONAL TANK -->
            <div class="flex flex-col items-center gap-3">
              <div class="relative w-28 h-64 bg-track rounded-lg overflow-hidden shadow-card">
                <div id="fill" class="absolute bottom-0 inset-x-0 bg-volume rounded-b-lg" style="height:75%">
                  <div class="h-[2px] bg-primary/70"></div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span id="pct" class="bg-badge/90 rounded-full px-3 py-1 text-xl font-bold text-highlight">75%</span>
                </div>
              </div>
              <p class="anno text-xs text-muted">TQ-<span id="tagNum">15</span> · 05/08/2026</p>
            </div>

            <!-- CONDICIONAL SELECT TANK -->
            <div class="flex flex-col gap-3">
              <p class="name text-xs font-semibold text-muted">Selecionar tanque</p>
              <div id="tankGrid" class="grid grid-cols-3 gap-2">
                <button data-t="13"
                  class="w-10 h-10 rounded-sm border border-transparent bg-control text-secondary shadow-ctrl text-sm font-medium hover:bg-raised">13</button>
                <button data-t="14"
                  class="w-10 h-10 rounded-sm border border-transparent bg-control text-secondary shadow-ctrl text-sm font-medium hover:bg-raised">14</button>
                <button data-t="15"
                  class="w-10 h-10 rounded-sm border border-brand bg-raised text-primary shadow-ctrl text-sm font-medium hover:bg-raised"
                  aria-pressed="true">15</button>
                <button data-t="16"
                  class="w-10 h-10 rounded-sm border border-transparent bg-control text-secondary shadow-ctrl text-sm font-medium hover:bg-raised">16</button>
                <button data-t="17"
                  class="w-10 h-10 rounded-sm border border-transparent bg-control text-secondary shadow-ctrl text-sm font-medium hover:bg-raised">17</button>
                <button data-t="18"
                  class="w-10 h-10 rounded-sm border border-transparent bg-control text-secondary shadow-ctrl text-sm font-medium hover:bg-raised">18</button>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>


  </body>

</template>
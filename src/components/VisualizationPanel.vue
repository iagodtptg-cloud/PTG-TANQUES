<template>
  <div id="view" class="flex-1 p-6 rounded-2xl flex flex-col items-center justify-center"
    :style="{ background: theme.panelBg }">
      <div v-if="
      containerSelecionado?.tipo === 'tanque' &&
      tanqueSelecionado
    " class="flex flex-col items-center gap-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl font-bold" :style="{ color: theme.textPrimary }">
          {{
            tanques.find(
              tanque => tanque.id === tanqueSelecionado
            )?.nome
          }}
        </span>
        <span v-if="tanqueSelecionadoObj?.variacoes?.length > 0"
          class="text-sm font-medium px-3 py-1 rounded-full"
          :style="{ 
            background: tanqueSelecionadoObj.variacoes[tanqueSelecionadoObj.variacaoSelecionada]?.cor,
            color: '#fff',
            opacity: 0.8
          }">
          {{ tanqueSelecionadoObj.variacoes[tanqueSelecionadoObj.variacaoSelecionada]?.nome }}
        </span>
      </div>

      <div class="flex items-center gap-6">
        <TanqueIcon :size="210" :fillPercent="(
            tanques.find(
              tanque => tanque.id === tanqueSelecionado
            )?.atual /
            tanques.find(
              tanque => tanque.id === tanqueSelecionado
            )?.capacidade
          ) * 100
          " :color="corFillAtual" />

        <div class="flex flex-col text-2xl">
          <span class="font-bold" :style="{ color: theme.textPrimary }">
            {{
              formatarQuantidade(
                tanques.find(
                  tanque => tanque.id === tanqueSelecionado
                )?.atual
              )
            }}L
          </span>

          <span :style="{ color: theme.textMuted }">
            /{{
              formatarQuantidade(
                tanques.find(
                  tanque => tanque.id === tanqueSelecionado
                )?.capacidade
              )
            }}L{{ tanques.find(tanque => tanque.id === tanqueSelecionado)?.isInox ? ` (${tanques.find(tanque => tanque.id === tanqueSelecionado)?.txCnv}cm)` : '' }}
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="
      containerSelecionado?.tipo === 'ibc' &&
      infoIBC
    " class="flex flex-col items-center gap-4 w-full">
      <span class="text-2xl font-bold" :style="{ color: theme.textPrimary }">
        CONTAINER 1000 LITROS
      </span>

      <div class="max-h-72 overflow-y-auto w-full flex justify-center scroll-container px-2">
        <div class="grid grid-cols-5 gap-2 content-start">
          <div v-for="i in unidadesIBC.exibir" :key="i" class="flex items-center justify-center">
            <IBCIcon :size="50" :fillPercent="i <= Math.floor(
                unidadesIBC.valor /
                unidadesIBC.capacidade
              )
                  ? 100
                  : unidadesIBC.parcial * 100
                " :color="theme.liquidFill" />
          </div>
        </div>
      </div>

      <div class="flex flex-col text-2xl text-center">
        <span class="font-bold" :style="{ color: theme.textPrimary }">
          {{ formatarQuantidade(unidadesIBC.valor) }}L
        </span>

        <span :style="{ color: theme.textMuted }">
          {{ unidadesIBC.total }} unidades
          {{
            unidadesIBC.total > MAX_QUADRADINHOS
              ? ` (${MAX_QUADRADINHOS} visíveis)`
              : ''
          }}
        </span>
      </div>
    </div>

    <div v-else-if="
      containerSelecionado?.tipo === 'bb' &&
      infoBB
    " class="flex flex-col items-center gap-4 w-full">
      <span class="text-2xl font-bold" :style="{ color: theme.textPrimary }">
        BOMBONA {{ containerSelecionado.valor }} LITROS
      </span>

      <div class="max-h-72 overflow-y-auto w-full flex justify-center scroll-container px-2">
        <div class="grid grid-cols-5 gap-2 content-start">
          <div v-for="i in unidadesBB.exibir" :key="i" class="flex items-center justify-center">
            <BombonaIcon :size="50" :fillPercent="i <= Math.floor(
                unidadesBB.valor /
                unidadesBB.capacidade
              )
                  ? 100
                  : unidadesBB.parcial * 100
                " :color="theme.liquidFill" />
          </div>
        </div>
      </div>

      <div class="flex flex-col text-2xl text-center">
        <span class="font-bold" :style="{ color: theme.textPrimary }">
          {{ formatarQuantidade(unidadesBB.valor) }}L
        </span>

        <span :style="{ color: theme.textMuted }">
          {{ unidadesBB.total }} unidades
          {{
            unidadesBB.total > MAX_QUADRADINHOS
              ? ` (${MAX_QUADRADINHOS} visíveis)`
              : ''
          }}
        </span>
      </div>
    </div>

    <div v-else class="text-center italic">
      <span class="text-xl" :style="{ color: theme.textMuted }">
        Selecione um container para visualizar
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHomePage } from './composables/useHomePage'
import { formatarQuantidade } from './composables/useHomePage/formatacao'
import TanqueIcon from './icons/TanqueIcon.vue'
import IBCIcon from './icons/IBCIcon.vue'
import BombonaIcon from './icons/BombonaIcon.vue'

const {
  theme,
  containerSelecionado,
  tanqueSelecionado,
  tanques,
  infoIBC,
  infoBB,
  unidadesIBC,
  unidadesBB,
  MAX_QUADRADINHOS
} = useHomePage()

const tanqueSelecionadoObj = computed(() => {
  return tanques.value.find(t => t.id === tanqueSelecionado.value)
})

const corFillAtual = computed(() => {
  const tanque = tanqueSelecionadoObj.value
  if (tanque?.variacoes?.length > 0) {
    return tanque.variacoes[tanque.variacaoSelecionada]?.cor || theme.liquidFill
  }
  return theme.liquidFill
})
</script>

<style>
.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
</style>
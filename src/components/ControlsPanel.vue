<template>
  <div v-if="selecionado && containerSelecionado" id="controls"
    class="flex-1 p-6 rounded-2xl flex flex-col items-center justify-between" :style="{ background: theme.panelBg }">
    <div v-if="alertMsg" class="w-full text-center py-2 px-4 rounded-lg mb-2 text-sm font-medium transition-all"
      :style="{
        background:
          alertType === 'success'
            ? '#16a34a'
            : '#dc2626',
        color: '#fff'
      }">
      {{ alertMsg }}
    </div>

    <label class="text-2xl font-bold italic mt-4 text-center" :style="{ color: theme.textWhite }">
      {{ tituloControles }}
      <span v-if="temVariacoes && tanqueSelecionadoObj?.variations?.[selectedVariationLocal]?.nome" class="ml-2 text-lg" :style="{ color: tanqueSelecionadoObj?.variations?.[selectedVariationLocal]?.cor }">
        ({{ tanqueSelecionadoObj?.variations?.[selectedVariationLocal]?.nome }})
      </span>
    </label>

    <div id="controls-input" class="flex flex-col items-center gap-6 w-full">
      <div class="flex items-center gap-2">
        <input :value="quantidadeEmFoco
            ? quantidadeInput
            : formatarQuantidade(
                normalizarQuantidade(quantidadeInput)
              )
          " type="text" inputmode="decimal"
          class="w-110 px-4 py-3 rounded-lg text-center text-2xl border-none focus:outline-2" :style="{
            background: theme.surfaceBg,
            color: theme.textWhite
          }" placeholder="0" @focus="quantidadeEmFoco = true" @input="aoDigitarQuantidade" @blur="aoSairQuantidade" />
        <span class="text-2xl font-bold" :style="{ color: theme.textWhite, minWidth: '35px' }">
          {{ unidadeAtual }}
        </span>
      </div>

      <div class="flex gap-20">
        <button class="px-6 py-3 w-45 rounded-lg text-white font-medium transition-colors"
          :style="{ background: theme.btnSuccess }" @click="entrada" @mouseenter="
            $event.currentTarget.style.background =
            theme.btnSuccessHover
            " @mouseleave="
            $event.currentTarget.style.background =
            theme.btnSuccess
            ">
          Entrada
        </button>

        <button class="px-6 py-3 w-45 rounded-lg text-white font-medium transition-colors"
          :style="{ background: theme.btnDanger }" @click="saida" @mouseenter="
            $event.currentTarget.style.background =
            theme.btnDangerHover
            " @mouseleave="
            $event.currentTarget.style.background =
            theme.btnDanger
            ">
          Saída
        </button>
      </div>

      <div v-if="temVariacoes" class="w-full flex flex-col gap-2">
        <button class="w-full px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
          :style="{ background: theme.surfaceAlt }"
          @click="abrirConfigVariacao">
          {{ configVariacaoAberta ? '▼ Configurar Variações' : '▶ Configurar Variações' }}
        </button>

        <div v-if="configVariacaoAberta" class="w-full p-4 rounded-lg flex flex-col gap-3"
          :style="{ background: theme.surfaceAlt }">
          <div v-for="(variacao, idx) in tanqueSelecionadoObj?.variations" :key="idx" class="flex gap-2 items-center">
            <input type="checkbox" 
              :checked="tanqueSelecionadoObj.selectedVariation === idx"
              @change="tanqueSelecionadoObj.selectedVariation = idx"
              class="w-4 h-4 cursor-pointer" />
            <input v-model="tanqueSelecionadoObj.variations[idx].nome" type="text" 
              class="flex-1 px-3 py-2 rounded-lg text-sm"
              :style="{
                background: theme.surfaceBg,
                color: theme.textWhite,
                border: `1px solid ${theme.borderColor}`
              }" 
              placeholder="Variação..." />
            <input v-model="tanqueSelecionadoObj.variations[idx].cor" type="color" 
              class="w-10 h-8 rounded-lg cursor-pointer" />
          </div>

          <div class="flex gap-2 mt-2">
            <button class="flex-1 px-3 py-2 rounded-lg text-white font-medium transition-colors text-sm"
              :style="{ background: theme.btnSuccess }"
              @click="fecharConfigVariacao">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="h-8"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHomePage } from './composables/useHomePage'
import { formatarQuantidade, normalizarQuantidade, formatarDuranteDigitacao, formatarQuantidadeAoSair } from './composables/useHomePage/formatacao'

const {
  theme,
  alertMsg,
  alertType,
  tanques,
  quantidadeInput,
  quantidadeEmFoco,
  selecionado,
  tanqueSelecionado,
  containerSelecionado,
  tituloControles,
  entrada,
  saida,
  configVariacaoAberta,
  salvarVariacoes
} = useHomePage()

const capacidadeMaxima = computed(() => {
  if (containerSelecionado.value?.tipo === 'tanque' && tanqueSelecionado.value) {
    const tanque = tanques.value.find(t => t.id === tanqueSelecionado.value)
    return tanque?.realCapacity || 0
  }
  return 0
})

const unidadeAtual = computed(() => {
  if (containerSelecionado.value?.tipo === 'tanque' && tanqueSelecionado.value) {
    const tanque = tanques.value.find(t => t.id === tanqueSelecionado.value)
    return tanque?.isInox ? 'CM' : 'L'
  }
  return 'L'
})

const tanqueSelecionadoObj = computed(() => {
  return tanques.value.find(t => t.id === tanqueSelecionado.value)
})

const selectedVariationLocal = computed(() => {
  return tanqueSelecionadoObj.value?.selectedVariation ?? 0
})

const temVariacoes = computed(() => {
  return tanqueSelecionadoObj.value?.variations?.length > 0
})

function abrirConfigVariacao() {
  configVariacaoAberta.value = !configVariacaoAberta.value
}

function fecharConfigVariacao() {
  configVariacaoAberta.value = false
  salvarVariacoes()
}

const aoDigitarQuantidade = (event) => formatarDuranteDigitacao(event, quantidadeInput, capacidadeMaxima.value)
const aoSairQuantidade = () => {
  quantidadeEmFoco.value = false
  formatarQuantidadeAoSair(quantidadeInput, capacidadeMaxima.value)
}
</script>
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
    </label>

    <div id="controls-input" class="flex flex-col items-center gap-6">
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
  saida
} = useHomePage()

const capacidadeMaxima = computed(() => {
  if (containerSelecionado.value?.tipo === 'tanque' && tanqueSelecionado.value) {
    const tanque = tanques.value.find(t => t.id === tanqueSelecionado.value)
    return tanque?.capacidade || 0
  }
  return 0
})

const aoDigitarQuantidade = (event) => formatarDuranteDigitacao(event, quantidadeInput, capacidadeMaxima.value)
const aoSairQuantidade = () => {
  quantidadeEmFoco.value = false
  formatarQuantidadeAoSair(quantidadeInput, capacidadeMaxima.value)
}
</script>
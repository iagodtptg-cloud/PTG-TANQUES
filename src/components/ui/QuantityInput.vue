<script setup>
import { computed } from 'vue'

defineProps({
  value: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  theme: { type: Object, default: () => ({}) }
})

defineEmits(['input', 'blur', 'entrada', 'saida'])

const formattedValue = computed(() => {
  return value
})

function handleInput(event) {
  emit('input', event)
}

function handleBlur(event) {
  emit('blur', event)
}

function handleEntrada() {
  emit('entrada')
}

function handleSaida() {
  emit('saida')
}
</script>

<template>
  <div id="controls-input" class="flex flex-col items-center gap-6">
    <input
      :value="formattedValue"
      type="text"
      inputmode="decimal"
      class="w-110 px-4 py-3 rounded-lg text-center text-2xl border-none focus:outline-2"
      :class="[theme.surfaceClass, theme.textWhiteClass]"
      placeholder="0"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur" />

    <div class="flex gap-20">
      <button
        class="px-6 py-3 w-45 rounded-lg text-white font-medium transition-colors"
        :class="theme.btnSuccessClass"
        :disabled="disabled"
        @click="handleEntrada">
        Entrada
      </button>

      <button
        class="px-6 py-3 w-45 rounded-lg text-white font-medium transition-colors"
        :class="theme.btnDangerClass"
        :disabled="disabled"
        @click="handleSaida">
        Saída
      </button>
    </div>
  </div>
</template>
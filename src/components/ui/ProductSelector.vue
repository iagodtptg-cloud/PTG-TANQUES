<script setup>
import { ref, computed } from 'vue'
import TanqueIcon from '../icons/TanqueIcon.vue'

defineProps({
  produtos: { type: Array, default: () => [] },
  selecionado: { type: [Number, null], default: null },
  tanques: { type: Array, default: () => [] },
  infoIBC: { type: [Array, null], default: null },
  infoBB: { type: [Array, null], default: null },
  containerSelecionado: { type: [Object, null], default: null },
  theme: { type: Object, default: () => ({}) }
})

defineEmits(['select-produto', 'select-container', 'clear-selection'])

const busca = ref('')
const dropdownOpen = ref(false)
const hoveredProduto = ref(null)
const hoveredTanque = ref(null)
const dropdownRef = ref(null)

const produtosFiltrados = computed(() => {
  return produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.value.toLowerCase())
  )
})

const selectedProduto = computed(() => {
  return produtos.find(p => p.id === selecionado)
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function handleSelectProduto(produtoId) {
  emit('select-produto', produtoId)
}

function handleClearSelection() {
  emit('clear-selection')
}

function handleSelectContainer(type, id) {
  emit('select-container', { type, id })
}

function onClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}
</script>

<template>
  <div class="flex-1 p-6 rounded-2xl flex flex-col gap-4" :class="theme.panelClass">
    <label class="text-2xl font-bold italic text-center" :class="theme.textWhiteClass">
      PRODUTOS
    </label>

    <div ref="dropdownRef" class="relative">
      <button
        class="w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors"
        :class="[theme.surfaceClass, theme.textWhiteClass]"
        @click="toggleDropdown">
        {{
          selectedProduto
            ? selectedProduto.nome
            : 'Selecionar produto'
        }}

        <svg
class="w-4 h-4 transition-transform" :class="{ 'rotate-180': dropdownOpen }" fill="none"
          viewBox="0 0 24 24">
          <path
stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="m19 9-7 7-7-7" />
        </svg>
      </button>

      <div
v-if="dropdownOpen" class="absolute top-full left-0 mt-2 z-50 w-full rounded-lg shadow-lg overflow-hidden"
        :class="[theme.surfaceAltClass, theme.borderClass]">
        <div class="p-2" :class="theme.borderClass">
          <input
v-model="busca" type="text" placeholder="Buscar produto..."
            class="w-full px-3 py-2 rounded-lg text-sm" :class="[theme.inputClass, theme.borderClass]" />
        </div>

        <ul class="max-h-48 overflow-y-auto p-2">
          <li
v-for="produto in produtosFiltrados" :key="produto.id"
            class="flex items-center p-2 rounded-lg transition-colors cursor-pointer"
            :class="[
              theme.hoverClass,
              hoveredProduto === produto.id || selecionado === produto.id ? theme.hoverClass : ''
            ]"
            @mouseenter="hoveredProduto = produto.id"
            @mouseleave="hoveredProduto = null"
            @click="handleSelectProduto(produto.id)">
            <div class="inline-flex items-center gap-2 text-base font-medium" :class="theme.textPrimaryClass">
              <span>🧪</span>
              {{ produto.nome }}
            </div>
          </li>

          <li v-if="produtosFiltrados.length === 0" class="p-3 text-center text-base italic" :class="theme.textMutedClass">
            Nenhum resultado
          </li>
        </ul>

        <div v-if="selecionado" class="p-2" :class="theme.borderClass">
          <button
            class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            :class="theme.btnDangerClass"
            @click="handleClearSelection">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <path
stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 0-1 1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
            </svg>
            Limpar seleção
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-3 p-4 rounded-xl overflow-hidden" :class="theme.surfaceClass">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 flex-1 overflow-y-auto content-start">
        <div v-if="!selecionado" class="col-span-full flex items-center justify-center h-full">
          <span class="text-base italic" :class="theme.textMutedClass">
            Selecione um produto para ver os tanques
          </span>
        </div>

        <div
v-for="tanque in tanques" :key="tanque.id"
          class="rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-colors p-2"
          :class="[
            theme.surfaceAltClass,
            theme.hoverClass,
            hoveredTanque === tanque.id || selecionado === tanque.id ? theme.hoverClass : ''
          ]"
          @mouseenter="hoveredTanque = tanque.id"
          @mouseleave="hoveredTanque = null"
          @click="handleSelectContainer('tanque', tanque.id)">
          <TanqueIcon :size="60" :fill-percent="(tanque.atual / tanque.capacidade) * 100" :color="theme.theme.liquidFill" />

          <span class="text-xs text-center font-medium" :class="theme.textPrimaryClass">
            {{ tanque.nome }}
          </span>

          <div class="flex flex-col text-xs text-center">
            <span class="font-bold" :class="theme.textPrimaryClass">
              {{ tanque.atual.toLocaleString('pt-BR') }}L
            </span>

            <span :class="theme.textMutedClass">
              /{{ tanque.capacidade.toLocaleString('pt-BR') }}L
            </span>
          </div>
        </div>
      </div>

      <div v-if="infoIBC" id="ibc">
        <button
class="flex-1 w-full px-4 py-3 rounded-lg text-white font-medium transition-colors"
          :class="[
            containerSelecionado?.tipo === 'ibc'
              ? theme.btnPrimaryClass.replace('hover:', '')
              : theme.btnPrimaryClass
          ]"
          @click="handleSelectContainer('ibc')">
          IBC
        </button>
      </div>

      <div v-if="infoBB" class="flex gap-3">
        <button
v-for="(value, index) in infoBB" :key="index"
          class="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors"
          :class="[
            containerSelecionado?.tipo === 'bb' && containerSelecionado?.valor === value[1]
              ? theme.btnPrimaryClass.replace('hover:', '')
              : theme.btnPrimaryClass
          ]"
          @click="handleSelectContainer('bb', value[1])">
          {{ value[1] }}
        </button>
      </div>
    </div>
  </div>
</template>
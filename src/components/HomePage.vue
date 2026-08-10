<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getProductInfo, getProdutos } from './composables/sheetsapi'

const produtos = ref([])
const tanques = ref([])

const busca = ref('')
const dropdownOpen = ref(false)
const selecionado = ref(null)
const dropdownRef = ref(null)

const produtosFiltrados = computed(() => {
  return produtos.value.filter(p =>
    p.nome.toLowerCase().includes(busca.value.toLowerCase())
  )
})

const tanquesGrid = computed(() => {
  return tanques.value
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

async function selecionarTanque(id) {
  selecionado.value = id
  dropdownOpen.value = false
  const produto = produtos.value.find(p => p.id === id)
  if (!produto) return
  try {
    const data = await getProductInfo(produto.nome)
    tanques.value = (data.INFO_TANQUES || []).map((row, i) => ({ id: i + 1, nome: row[1] }))
  } catch (e) {
    console.error('Erro ao carregar tanques:', e)
  }
}

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

async function carregarProdutos() {
  try {
    const data = await getProdutos()
    produtos.value = (data.values || []).map((row, i) => ({ id: i + 1, nome: row[0] }))
  } catch (e) {
    console.error('Erro ao carregar produtos:', e)
  }
}

async function teste() {
  const tanque = tanques.value.find(t => t.id === selecionado.value)
  if (!tanque) return
  console.log(await getProductInfo(tanque.nome))
}

onMounted(async () => {
  document.addEventListener('click', onClickOutside)
  await carregarProdutos()
})
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
<template>
  <main class="flex h-screen w-screen gap-4 p-4">
    <div class="flex-1 p-6 rounded-2xl bg-[#3a3e40] flex flex-col gap-4" id="search">
      <label class="text-2xl font-bold italic text-white text-center">PRODUTOS</label>

      <div class="relative" ref="dropdownRef">
        <button @click="toggleDropdown" class="w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-[#2a2d2e] text-white text-base font-medium hover:bg-[#4a4e50] transition-colors focus:outline-2 focus:outline-[#22c3dc]">
          {{ selecionado ? produtos.find(p => p.id === selecionado)?.nome : 'Selecionar produto' }}
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': dropdownOpen }" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
        </button>

        <div v-if="dropdownOpen" class="absolute top-full left-0 mt-2 z-50 w-full rounded-lg bg-[#2f3233] border border-[#4a4e50] shadow-lg overflow-hidden">
          <div class="p-2 border-b border-[#4a4e50]">
            <input v-model="busca" type="text" placeholder="Buscar tanque..." class="w-full px-3 py-2 rounded-lg bg-[#222222] text-white text-sm border border-[#4a4e50] focus:outline-2 focus:outline-[#22c3dc] placeholder:text-[#a6abad]" />
          </div>
          <ul class="max-h-48 overflow-y-auto p-2">
            <li v-for="produto in produtosFiltrados" :key="produto.id" class="flex items-center p-2 rounded-lg hover:bg-[#4a4e50] transition-colors cursor-pointer" :class="{ 'bg-[#4a4e50]': selecionado === produto.id }" @click="selecionarTanque(produto.id)">
              <div class="inline-flex items-center gap-2 text-base font-medium text-[#e0e0e0]">
                <span>🧪</span>
                {{ produto.nome }}
              </div>
            </li>
            <li v-if="produtosFiltrados.length === 0" class="p-3 text-center text-base text-[#a6abad] italic">Nenhum resultado</li>
          </ul>
          <div v-if="selecionado" class="p-2 border-t border-[#4a4e50]">
            <button @click="selecionado = null" class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#d32f2f] text-white text-sm font-medium hover:bg-[#b71c1c] transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/></svg>
              Limpar seleção
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-3 p-4 rounded-xl bg-[#2a2d2e] overflow-hidden">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 flex-1 overflow-y-auto content-start">
          <div v-if="!selecionado" class="col-span-full flex items-center justify-center h-full">
            <span class="text-base text-[#a6abad] italic">Selecione um produto para ver os tanques</span>
          </div>
          <div v-for="tanque in tanquesGrid" :key="tanque.id" class="aspect-square rounded-xl bg-[#2f3233] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#4a4e50] transition-colors p-2">
            <span class="text-2xl">🛢️</span>
            <span class="text-xs text-[#e0e0e0] text-center font-medium leading-tight">{{ tanque.nome }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="flex-1 px-4 py-3 rounded-lg bg-[#2e86f0] text-white font-medium hover:bg-[#4c8df5] transition-colors">Adicionar</button>
          <button class="flex-1 px-4 py-3 rounded-lg bg-[#ffb300] text-white font-medium hover:bg-[#ffc107] transition-colors">Editar</button>
          <button class="flex-1 px-4 py-3 rounded-lg bg-[#d32f2f] text-white font-medium hover:bg-[#b71c1c] transition-colors">Remover</button>
        </div>
      </div>
    </div>

    <div class="flex-1 p-6 rounded-2xl bg-[#3a3e40] flex flex-col items-center justify-between" id="controls">
      <label class="text-2xl font-bold italic text-white mt-4">HCL TANQUE 01</label>
      <div id="controls-input" class="flex flex-col items-center gap-6">
        <input type="number" class="w-110 px-4 py-3 rounded-lg bg-[#2a2d2e] text-white text-center text-2xl border-none focus:outline-2 focus:outline-[#22c3dc]" placeholder="0" />
        <div class="flex gap-20">
          <button class="px-6 py-3 w-45 rounded-lg bg-[#1ed71e] text-white font-medium hover:bg-[#00e626] transition-colors" v-on:click="teste">Entrada</button>
          <button class="px-6 py-3 w-45 rounded-lg bg-[#d32f2f] text-white font-medium hover:bg-[#b71c1c] transition-colors">Saída</button>
        </div>
      </div>
      <div class="h-8"></div>
    </div>

    <div class="flex-1 p-6 rounded-2xl bg-[#3a3e40]" id="view">

    </div>
  </main>
</template>
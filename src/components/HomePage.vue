<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'

import { useTheme } from './theme/useTheme'
import { useAlert } from './composables/useAlert'
import { useQuantityInput } from './composables/useQuantityInput'
import { useProducts } from './composables/useProducts'
import { useContainers } from './composables/useContainers'

import ProductSelector from './ui/ProductSelector.vue'
import QuantityInput from './ui/QuantityInput.vue'
import ContainerView from './ui/ContainerView.vue'
import AlertBanner from './ui/AlertBanner.vue'

const theme = useTheme()
const { alertMsg, alertType, showAlert } = useAlert()
const { 
  quantidadeInput, 
  formatarDuranteDigitacao, 
  formatarQuantidadeAoSair, 
  normalizarQuantidade
} = useQuantityInput()
const { 
  produtos, 
  selecionado, 
  carregarProdutos, 
  selecionarProduto, 
  limparProduto,
  onClickOutside 
} = useProducts()
const { 
  tanques, 
  infoIBC, 
  infoBB, 
  tanqueSelecionado, 
  containerSelecionado,
  carregarDadosProduto, 
  selecionarTanque, 
  selecionarIBC, 
  selecionarBB,
  handler 
} = useContainers()

const produtoSelecionado = computed(() => {
  return produtos.value.find(p => p.id === selecionado.value)
})

const currentContainer = computed(() => {
  if (!handler.value || !containerSelecionado.value) return null
  const h = handler.value
  let item = null
  
  if (containerSelecionado.value.tipo === 'tanque') {
    item = h.findById?.(tanqueSelecionado.value)
  } else if (containerSelecionado.value.tipo === 'ibc') {
    item = h.getItems?.()[0]
  } else if (containerSelecionado.value.tipo === 'bb') {
    item = h.findByCapacity?.(containerSelecionado.value.valor)
  }
  
  return { handler: h, item }
})

const tituloControles = computed(() => {
  if (!produtoSelecionado.value) return 'Selecione um tanque'
  
  if (containerSelecionado.value?.tipo === 'tanque') {
    const tanque = tanques.value.find(t => t.id === tanqueSelecionado.value)
    return tanque ? `${produtoSelecionado.value.nome} ${tanque.nome}` : produtoSelecionado.value.nome
  }
  
  if (containerSelecionado.value?.tipo === 'ibc') {
    return `${produtoSelecionado.value.nome} CONTAINER 1000 LITROS`
  }
  
  if (containerSelecionado.value?.tipo === 'bb') {
    return `${produtoSelecionado.value.nome} BOMBONA ${containerSelecionado.value.valor} LITROS`
  }
  
  return produtoSelecionado.value.nome
})

async function handleSelectProduto(produtoId) {
  selecionarProduto(produtoId)
  tanqueSelecionado.value = null
  containerSelecionado.value = null
  quantidadeInput.value = ''
  
  const produto = produtos.value.find(p => p.id === produtoId)
  if (produto) {
    await carregarDadosProduto(produto.nome)
  }
}

async function handleEntrada() {
  const qnt = normalizarQuantidade(quantidadeInput.value)
  
  if (!qnt || qnt <= 0) {
    showAlert('Informe uma quantidade válida')
    return
  }
  
  if (!produtoSelecionado.value || !currentContainer.value) {
    showAlert('Selecione um produto e um container')
    return
  }
  
  const err = currentContainer.value.handler.validateEntry(currentContainer.value.item, qnt)
  if (err) {
    showAlert(err)
    return
  }
  
  try {
    await currentContainer.value.handler.executeEntry(produtoSelecionado.value, currentContainer.value.item, qnt)
    quantidadeInput.value = ''
    showAlert('Entrada registrada com sucesso', 'success')
  } catch (error) {
    console.error('Erro ao registrar entrada:', error)
    showAlert('Erro ao registrar entrada')
  }
}

async function handleSaida() {
  const qnt = normalizarQuantidade(quantidadeInput.value)
  
  if (!qnt || qnt <= 0) {
    showAlert('Informe uma quantidade válida')
    return
  }
  
  if (!produtoSelecionado.value || !currentContainer.value) {
    showAlert('Selecione um produto e um container')
    return
  }
  
  const err = currentContainer.value.handler.validateExit(currentContainer.value.item, qnt)
  if (err) {
    showAlert(err)
    return
  }
  
  try {
    await currentContainer.value.handler.executeExit(produtoSelecionado.value, currentContainer.value.item, qnt)
    quantidadeInput.value = ''
    showAlert('Saída registrada com sucesso', 'success')
  } catch (error) {
    console.error('Erro ao registrar saída:', error)
    showAlert('Erro ao registrar saída')
  }
}

function handleSelectContainer(event) {
  if (event.type === 'tanque') {
    selecionarTanque(event.id)
  } else if (event.type === 'ibc') {
    selecionarIBC()
  } else if (event.type === 'bb') {
    selecionarBB(event.id)
  }
}

function handleClearSelection() {
  limparProduto()
  tanqueSelecionado.value = null
  containerSelecionado.value = null
  tanques.value = []
  infoIBC.value = null
  infoBB.value = null
}

onMounted(async () => {
  document.addEventListener('click', onClickOutside)
  await carregarProdutos()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <main class="flex h-screen w-screen gap-4 p-4" :style="theme.cssVars">
    <ProductSelector
      :produtos="produtos"
      :selecionado="selecionado"
      :tanques="tanques"
      :info-ibc="infoIBC"
      :info-bb="infoBB"
      :container-selecionado="containerSelecionado"
      :theme="theme"
      @select-produto="handleSelectProduto"
      @select-container="handleSelectContainer"
      @clear-selection="handleClearSelection" />

    <div v-if="selecionado && containerSelecionado" class="flex-1 p-6 rounded-2xl flex flex-col" :class="theme.panelClass">
      <AlertBanner :message="alertMsg" :type="alertType" />

      <label class="text-2xl font-bold italic mt-4 text-center" :class="theme.textWhiteClass">
        {{ tituloControles }}
      </label>

      <ContainerView :container="currentContainer" :theme="theme" />

      <QuantityInput
        :value="quantidadeInput"
        :disabled="!currentContainer"
        :theme="theme"
        @input="formatarDuranteDigitacao"
        @blur="formatarQuantidadeAoSair"
        @entrada="handleEntrada"
        @saida="handleSaida" />
    </div>

    <div v-else class="flex-1 p-6 rounded-2xl flex flex-col items-center justify-center" :class="theme.panelClass">
      <span class="text-xl" :class="theme.textMutedClass">
        Selecione um produto e container
      </span>
    </div>
  </main>
</template>
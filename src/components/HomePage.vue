<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

import { useHomePage } from './composables/useHomePage'

import ProductsPanel from './ProductsPanel.vue'
import ControlsPanel from './ControlsPanel.vue'
import VisualizationPanel from './VisualizationPanel.vue'

const hp = useHomePage()

onMounted(() => {
  document.addEventListener('click', hp.onClickOutside)
  hp.carregarProdutos()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', hp.onClickOutside)
})
</script>

<template>
  <main class="flex h-screen w-screen gap-4 p-4" :style="hp.cssVars">
    <ProductsPanel />
    <ControlsPanel />
    <VisualizationPanel />
  </main>
</template>
<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

import { useHomePage } from './composables/useHomePage'

import LogoHeader from './LogoHeader.vue'
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
  <main class="flex flex-col h-screen w-screen p-4 overflow-hidden" :style="hp.cssVars">
    <LogoHeader class="flex-shrink-0" />
    <div class="flex gap-4 flex-1 min-h-0">
      <ProductsPanel />
      <ControlsPanel />
      <VisualizationPanel />
    </div>
  </main>
</template>
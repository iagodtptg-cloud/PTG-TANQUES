<script setup>
import { computed } from 'vue'
import TanqueIcon from '../icons/TanqueIcon.vue'
import IBCIcon from '../icons/IBCIcon.vue'
import BombonaIcon from '../icons/BombonaIcon.vue'

defineProps({
  container: { type: Object, default: null },
  theme: { type: Object, default: () => ({}) }
})

const containerIcon = computed(() => {
  if (!container?.handler) return null
  switch (container.handler.icon) {
    case 'TanqueIcon': return TanqueIcon
    case 'IBCIcon': return IBCIcon
    case 'BombonaIcon': return BombonaIcon
    default: return null
  }
})

const getDisplayItems = () => {
  if (!container?.handler) return []
  const { handler, item } = container
  
  if (handler.type === 'tanque') {
    return item ? [{ fillPercent: item.fillPercent }] : []
  }
  
  if (handler.type === 'ibc') {
    const data = handler.getDisplayData()
    const total = Math.ceil(data.current / data.capacity)
    const exibir = Math.min(total, handler.maxVisible)
    const items = []
    for (let i = 1; i <= exibir; i++) {
      items.push({
        fillPercent: i <= Math.floor(data.current / data.capacity) ? 100 : (data.fillPercent % 100)
      })
    }
    return items
  }
  
  if (handler.type === 'bb') {
    const data = handler.getDisplayData(item)
    const total = Math.ceil(data.current / data.capacity)
    const exibir = Math.min(total, handler.maxVisible)
    const items = []
    for (let i = 1; i <= exibir; i++) {
      items.push({
        fillPercent: i <= Math.floor(data.current / data.capacity) ? 100 : (data.fillPercent % 100)
      })
    }
    return items
  }
  
  return []
}

const getHeaderText = () => {
  if (!container?.handler) return ''
  const { handler, item } = container
  
  if (handler.type === 'tanque') {
    return item?.name || ''
  }
  
  if (handler.type === 'ibc') {
    return 'CONTAINER 1000 LITROS'
  }
  
  if (handler.type === 'bb') {
    return `BOMBONA ${item?.[1] || 0} LITROS`
  }
  
  return ''
}

const getFooterText = () => {
  if (!container?.handler) return { current: '', total: '' }
  const { handler, item } = container
  
  if (handler.type === 'tanque') {
    return {
      current: `${item?.current?.toLocaleString('pt-BR') || 0}L`,
      total: `/${item?.capacity?.toLocaleString('pt-BR') || 0}L`
    }
  }
  
  const data = handler.getDisplayData(item)
  const total = Math.ceil(data.current / data.capacity)
  return {
    current: `${data.current.toLocaleString('pt-BR')}L`,
    total: `${total} unidades${total > handler.maxVisible ? ` (${handler.maxVisible} visíveis)` : ''}`
  }
}
</script>

<template>
  <div id="view" class="flex-1 p-6 rounded-2xl flex flex-col items-center justify-center" :class="theme.panelClass">
    <div v-if="container" class="flex flex-col items-center gap-4">
      <span class="text-2xl font-bold" :class="theme.textPrimaryClass">
        {{ getHeaderText() }}
      </span>

      <div v-if="container.handler.type === 'tanque' && container.item" class="flex items-center gap-6">
        <component
          :is="containerIcon"
          :size="container.handler.viewIconSize"
          :fill-percent="container.item.fillPercent"
          :color="theme.theme.liquidFill" />

        <div class="flex flex-col text-2xl">
          <span class="font-bold" :class="theme.textPrimaryClass">
            {{ container.item.current.toLocaleString('pt-BR') }}L
          </span>

          <span :class="theme.textMutedClass">
            /{{ container.item.capacity.toLocaleString('pt-BR') }}L
          </span>
        </div>
      </div>

      <div v-else-if="container.handler.type === 'ibc' || container.handler.type === 'bb'" class="flex flex-col items-center gap-4 w-full">
        <div class="max-h-72 overflow-y-auto w-full flex justify-center scroll-container px-2">
          <div :class="['grid', `grid-cols-${container.handler.gridCols}`, 'gap-2', 'content-start']">
            <div v-for="(item, index) in getDisplayItems()" :key="index" class="flex items-center justify-center">
              <component
                :is="containerIcon"
                :size="container.handler.iconSize"
                :fill-percent="item.fillPercent"
                :color="theme.theme.liquidFill" />
            </div>
          </div>
        </div>

        <div class="flex flex-col text-2xl text-center">
          <span class="font-bold" :class="theme.textPrimaryClass">
            {{ getFooterText().current }}
          </span>

          <span :class="theme.textMutedClass">
            {{ getFooterText().total }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="text-center italic">
      <span class="text-xl" :class="theme.textMutedClass">
        Selecione um container para visualizar
      </span>
    </div>
  </div>
</template>

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
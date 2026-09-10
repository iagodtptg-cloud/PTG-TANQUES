<template>
  <div class="flex-1 p-6 rounded-2xl flex flex-col gap-4" :style="{ background: theme.panelBg }">
    <label class="text-2xl font-bold italic text-center" :style="{ color: theme.textWhite }">
      PRODUTOS
    </label>

    <div ref="dropdownRef" class="relative">
      <button
        class="w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-2 hover-bg-btn"
        :style="{
          background: theme.surfaceBg,
          color: theme.textWhite
        }" @click="toggleDropdown">
        {{
          selecionado
            ? produtos.find(
              produto => produto.id === selecionado
            )?.nome
            : 'Selecionar produto'
        }}

        <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': dropdownOpen }" fill="none"
          viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="m19 9-7 7-7-7" />
        </svg>
      </button>

      <div v-if="dropdownOpen" class="absolute top-full left-0 mt-2 z-50 w-full rounded-lg shadow-lg overflow-hidden"
        :style="{
          background: theme.surfaceAlt,
          border: `1px solid ${theme.borderColor}`
        }">
        <div class="p-2" :style="{
          borderBottom: `1px solid ${theme.borderColor}`
        }">
          <input v-model="busca" type="text" placeholder="Buscar produto..."
            class="w-full px-3 py-2 rounded-lg text-sm border focus:outline-2" :style="{
              background: theme.inputBg,
              color: theme.textWhite,
              borderColor: theme.borderColor
            }" />
        </div>

        <ul class="max-h-48 overflow-y-auto p-2">
          <li v-for="produto in produtosFiltrados" :key="produto.id"
            class="flex items-center p-2 rounded-lg transition-colors cursor-pointer" :style="{
              background:
                hoveredProduto === produto.id ||
                  selecionado === produto.id
                  ? theme.hoverBg
                  : 'transparent'
            }" @mouseenter="hoveredProduto = produto.id" @mouseleave="hoveredProduto = null"
            @click="selecionarTanque(produto.id)">
            <div class="inline-flex items-center gap-2 text-base font-medium" :style="{ color: theme.textPrimary }">
              <span>🧪</span>
              {{ produto.nome }}
            </div>
          </li>

          <li v-if="produtosFiltrados.length === 0" class="p-3 text-center text-base italic"
            :style="{ color: theme.textMuted }">
            Nenhum resultado
          </li>
        </ul>

        <div v-if="selecionado" class="p-2" :style="{
          borderTop: `1px solid ${theme.borderColor}`
        }">
          <button
            class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            :style="{ background: theme.btnDanger }" @click="limparProduto" @mouseenter="
              $event.currentTarget.style.background =
              theme.btnDangerHover
              " @mouseleave="
              $event.currentTarget.style.background =
              theme.btnDanger
              ">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 0-1 1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
            </svg>

            Limpar seleção
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-3 p-4 rounded-xl overflow-hidden" :style="{ background: theme.surfaceBg }">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 flex-1 overflow-y-auto content-start">
        <div v-if="!selecionado" class="col-span-full flex items-center justify-center h-full">
          <span class="text-base italic" :style="{ color: theme.textMuted }">
            Selecione um produto para ver os tanques
          </span>
        </div>

        <div v-for="tanque in tanquesGrid" :key="tanque.id"
          class="rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-colors p-2" :style="{
            background:
              hoveredTanque === tanque.id ||
                tanqueSelecionado === tanque.id
                ? theme.hoverBg
                : theme.surfaceAlt
          }" @mouseenter="hoveredTanque = tanque.id" @mouseleave="hoveredTanque = null"
          @click="selecionarTanqueGrid(tanque.id)">
          <TanqueIcon :size="65" :fillPercent="(tanque.atual / tanque.capacidade) * 100
            " :color="tanque.variacoes?.[tanque.variacaoSelecionada]?.cor || theme.liquidFill" />

          <span class="text-xs text-center font-medium" :style="{ color: theme.textPrimary }">
            {{ tanque.nome }}
          </span>

          <div class="flex flex-col text-xs text-center">
            <span class="font-bold" :style="{ color: theme.textPrimary }">
              {{ formatarQuantidade(tanque.atual) }}L
            </span>

            <span :style="{ color: theme.textMuted }">
              /{{ formatarQuantidade(tanque.capacidade) }}L
            </span>
          </div>
        </div>
      </div>

      <div v-if="infoIBC" id="ibc">
        <button class="flex-1 w-full px-4 py-3 rounded-lg text-white font-medium transition-colors" :style="{
          background:
            containerSelecionado?.tipo === 'ibc'
              ? theme.btnPrimaryHover
              : theme.btnPrimary
        }" @click="selecionarIBC" @mouseenter="
            $event.currentTarget.style.background =
            theme.btnPrimaryHover
            " @mouseleave="
            $event.currentTarget.style.background =
            containerSelecionado?.tipo === 'ibc'
              ? theme.btnPrimaryHover
              : theme.btnPrimary
            ">
          IBC
        </button>
      </div>

      <div v-if="infoBB" class="flex gap-3">
        <button v-for="(value, index) in infoBB" :key="index"
          class="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors" :style="{
            background:
              containerSelecionado?.tipo === 'bb' &&
                containerSelecionado?.valor === value[1]
                ? theme.btnPrimaryHover
                : theme.btnPrimary
          }" @click="selecionarBB(value)" @mouseenter="
            $event.currentTarget.style.background =
            theme.btnPrimaryHover
            " @mouseleave="
            $event.currentTarget.style.background =
            containerSelecionado?.tipo === 'bb' &&
              containerSelecionado?.valor === value[1]
              ? theme.btnPrimaryHover
              : theme.btnPrimary
            ">
          {{ value[1] }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

import TanqueIcon from './icons/TanqueIcon.vue'

import { useHomePage } from './composables/useHomePage'
import { formatarQuantidade } from './composables/useHomePage/formatacao'

const {
  theme,
  produtos,
  tanqueSelecionado,
  infoIBC,
  infoBB,
  containerSelecionado,
  busca,
  dropdownOpen,
  selecionado,
  dropdownRef,
  hoveredProduto,
  hoveredTanque,
  produtosFiltrados,
  tanquesGrid,
  toggleDropdown,
  selecionarTanque,
  limparProduto,
  selecionarTanqueGrid,
  selecionarIBC,
  selecionarBB,
  onClickOutside,
  carregarProdutos
} = useHomePage()

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  carregarProdutos()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>
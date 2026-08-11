<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getProductInfo, getProdutos, updateStorage } from './composables/sheetsapi'
import TanqueIcon from './icons/TanqueIcon.vue'
import IBCIcon from './icons/IBCIcon.vue'
import BombonaIcon from './icons/BombonaIcon.vue'

const theme = {
  panelBg: '#3a3e40',
  surfaceBg: '#2a2d2e',
  surfaceAlt: '#2f3233',
  inputBg: '#222222',
  hoverBg: '#4a4e50',
  borderColor: '#4a4e50',
  accent: '#22c3dc',
  textPrimary: '#e0e0e0',
  textMuted: '#a6abad',
  textWhite: '#ffffff',
  btnPrimary: '#2e86f0',
  btnPrimaryHover: '#4c8df5',
  btnSuccess: '#1ed71e',
  btnSuccessHover: '#00e626',
  btnDanger: '#d32f2f',
  btnDangerHover: '#b71c1c',
  iconStroke: '#9ca3af',
  liquidFill: '#22c3dc',
  scrollbarThumb: '#4a4e50',
  scrollbarThumbHover: '#6a6e70'
}

const cssVars = computed(() => ({
  '--panel-bg': theme.panelBg,
  '--surface-bg': theme.surfaceBg,
  '--surface-alt': theme.surfaceAlt,
  '--input-bg': theme.inputBg,
  '--hover-bg': theme.hoverBg,
  '--border-color': theme.borderColor,
  '--accent': theme.accent,
  '--text-primary': theme.textPrimary,
  '--text-muted': theme.textMuted,
  '--text-white': theme.textWhite,
  '--btn-primary': theme.btnPrimary,
  '--btn-primary-hover': theme.btnPrimaryHover,
  '--btn-success': theme.btnSuccess,
  '--btn-success-hover': theme.btnSuccessHover,
  '--btn-danger': theme.btnDanger,
  '--btn-danger-hover': theme.btnDangerHover,
  '--icon-stroke': theme.iconStroke,
  '--liquid-fill': theme.liquidFill,
  '--scrollbar-thumb': theme.scrollbarThumb,
  '--scrollbar-thumb-hover': theme.scrollbarThumbHover
}))

const produtos = ref([])
const tanques = ref([])

const tanqueSelecionado = ref(null)
const infoIBC = ref(null)
const infoBB = ref(null)
const containerSelecionado = ref(null)

const busca = ref('')
const dropdownOpen = ref(false)
const selecionado = ref(null)
const dropdownRef = ref(null)

const quantidadeInput = ref('')
const quantidadeEmFoco = ref(false)

const hoveredProduto = ref(null)
const hoveredTanque = ref(null)

const alertMsg = ref('')
const alertType = ref('error')
let alertTimer = null

const MAX_QUADRADINHOS = 100

function showAlert(msg, type = 'error') {
  alertMsg.value = msg
  alertType.value = type

  clearTimeout(alertTimer)

  alertTimer = setTimeout(() => {
    alertMsg.value = ''
  }, 3000)
}

/**
 * Formata apenas para exibição.
 *
 * Exemplos:
 * 1000    -> 1.000
 * 1250.5  -> 1.250,5
 */
function formatarQuantidade(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return ''
  }

  const numero = Number(valor)

  if (Number.isNaN(numero)) {
    return ''
  }

  return numero.toLocaleString('pt-BR', {
    useGrouping: true,
    maximumFractionDigits: 3
  })
}

/**
 * Converte o valor visual para número.
 *
 * Exemplos:
 * 1.000   -> 1000
 * 1.250,5 -> 1250.5
 */
function normalizarQuantidade(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 0
  }

  const texto = String(valor)
    .trim()
    .replace(/\./g, '')
    .replace(',', '.')

  const numero = Number(texto)

  return Number.isFinite(numero) ? numero : 0
}

function atualizarQuantidade(event) {
  quantidadeInput.value = event.target.value
}

function limparFormatacaoQuantidade() {
  quantidadeInput.value = quantidadeInput.value
    .replace(/\./g, '')
    .replace(',', '.')
}

function formatarQuantidadeAoSair() {
  const valor = normalizarQuantidade(quantidadeInput.value)

  quantidadeInput.value = valor > 0
    ? formatarQuantidade(valor)
    : ''
}

const tituloControles = computed(() => {
  const produto = produtos.value.find(
    produto => produto.id === selecionado.value
  )

  if (!produto) {
    return 'Selecione um tanque'
  }

  if (containerSelecionado.value?.tipo === 'tanque') {
    const tanque = tanques.value.find(
      tanque => tanque.id === tanqueSelecionado.value
    )

    return tanque
      ? `${produto.nome} ${tanque.nome}`
      : produto.nome
  }

  if (containerSelecionado.value?.tipo === 'ibc') {
    return `${produto.nome} CONTAINER 1000 LITROS`
  }

  if (containerSelecionado.value?.tipo === 'bb') {
    return `${produto.nome} BOMBONA ${containerSelecionado.value.valor} LITROS`
  }

  return produto.nome
})

const produtosFiltrados = computed(() => {
  return produtos.value.filter(produto =>
    produto.nome
      .toLowerCase()
      .includes(busca.value.toLowerCase())
  )
})

const tanquesGrid = computed(() => {
  return tanques.value
})

const unidadesIBC = computed(() => {
  if (!infoIBC.value) {
    return {
      valor: 0,
      capacidade: 0,
      total: 0,
      parcial: 0,
      exibir: 0
    }
  }

  const valorAtual = parseFloat(infoIBC.value[0]?.[3]) || 0
  const capacidade = parseFloat(infoIBC.value[0]?.[1]) || 1000
  const total = Math.ceil(valorAtual / capacidade)
  const parcial =
    (valorAtual / capacidade) - Math.floor(valorAtual / capacidade)

  return {
    valor: valorAtual,
    capacidade,
    total,
    parcial,
    exibir: Math.min(total, MAX_QUADRADINHOS)
  }
})

const unidadesBB = computed(() => {
  if (!infoBB.value || !containerSelecionado.value?.valor) {
    return {
      valor: 0,
      capacidade: 0,
      total: 0,
      parcial: 0,
      exibir: 0
    }
  }

  const bbSelecionada = infoBB.value.find(
    bb => bb[1] === containerSelecionado.value.valor
  )

  if (!bbSelecionada) {
    return {
      valor: 0,
      capacidade: 0,
      total: 0,
      parcial: 0,
      exibir: 0
    }
  }

  const valorAtual = parseFloat(bbSelecionada[3]) || 0
  const capacidade = parseFloat(bbSelecionada[1]) || 1
  const total = Math.ceil(valorAtual / capacidade)
  const parcial =
    (valorAtual / capacidade) - Math.floor(valorAtual / capacidade)

  return {
    valor: valorAtual,
    capacidade,
    total,
    parcial,
    exibir: Math.min(total, MAX_QUADRADINHOS)
  }
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

async function selecionarTanque(id) {
  selecionado.value = id

  tanqueSelecionado.value = null
  containerSelecionado.value = null

  dropdownOpen.value = false
  busca.value = ''

  quantidadeInput.value = ''

  const produto = produtos.value.find(
    produto => produto.id === id
  )

  if (!produto) {
    return
  }

  try {
    const data = await getProductInfo(produto.nome)

    tanques.value = (data.INFO_TANQUES || []).map((row, index) => ({
      id: index + 1,
      nome: row[1],
      capacidade: parseFloat(row[2]) || 0,
      atual: parseFloat(row[4]) || 0
    }))

    infoIBC.value = data.INFO_IBC || null
    infoBB.value = data.INFO_BB || null
  } catch (error) {
    console.error('Erro ao carregar tanques:', error)

    tanques.value = []
    infoIBC.value = null
    infoBB.value = null

    showAlert('Erro ao carregar dados do produto')
  }
}

function limparProduto() {
  selecionado.value = null
  tanqueSelecionado.value = null
  containerSelecionado.value = null

  tanques.value = []
  infoIBC.value = null
  infoBB.value = null

  quantidadeInput.value = ''
  busca.value = ''
  dropdownOpen.value = false
}

function selecionarTanqueGrid(id) {
  if (tanqueSelecionado.value === id) {
    tanqueSelecionado.value = null
    containerSelecionado.value = null
    return
  }

  tanqueSelecionado.value = id
  containerSelecionado.value = {
    tipo: 'tanque'
  }
}

function selecionarIBC() {
  tanqueSelecionado.value = null

  containerSelecionado.value = {
    tipo: 'ibc'
  }
}

function selecionarBB(value) {
  tanqueSelecionado.value = null

  containerSelecionado.value = {
    tipo: 'bb',
    valor: value[1]
  }
}

function onClickOutside(event) {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    dropdownOpen.value = false
  }
}

async function carregarProdutos() {
  try {
    const data = await getProdutos()

    produtos.value = (data.values || []).map((row, index) => ({
      id: index + 1,
      nome: row[0]
    }))
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    showAlert('Erro ao carregar produtos')
  }
}

async function entrada() {
  const qnt = normalizarQuantidade(quantidadeInput.value)

  if (!qnt || qnt <= 0) {
    showAlert('Informe uma quantidade válida')
    return
  }

  const produto = produtos.value.find(
    produto => produto.id === selecionado.value
  )

  if (!produto || !containerSelecionado.value) {
    showAlert('Selecione um produto e um container')
    return
  }

  try {
    if (
      containerSelecionado.value.tipo === 'tanque' &&
      tanqueSelecionado.value
    ) {
      const tanque = tanques.value.find(
        tanque => tanque.id === tanqueSelecionado.value
      )

      if (!tanque) {
        return
      }

      if (tanque.atual + qnt > tanque.capacidade) {
        const disponivel = tanque.capacidade - tanque.atual

        showAlert(
          `Excede capacidade. Disponível: ${formatarQuantidade(disponivel)}L`
        )

        return
      }

      const novoValor = await updateStorage(
        produto.nome,
        tanque.nome,
        qnt,
        'tanque'
      )

      tanque.atual = novoValor
    } else if (
      containerSelecionado.value.tipo === 'ibc'
    ) {
      if (!infoIBC.value?.[0]) {
        return
      }

      const novoValor = await updateStorage(
        produto.nome,
        null,
        qnt,
        'ibc'
      )

      infoIBC.value[0][3] = novoValor
    } else if (
      containerSelecionado.value.tipo === 'bb'
    ) {
      const bb = infoBB.value?.find(
        item => item[1] === containerSelecionado.value.valor
      )

      if (!bb) {
        return
      }

      const novoValor = await updateStorage(
        produto.nome,
        bb[1],
        qnt,
        'bb'
      )

      bb[3] = novoValor
    }

    quantidadeInput.value = ''

    showAlert(
      'Entrada registrada com sucesso',
      'success'
    )
  } catch (error) {
    console.error('Erro ao registrar entrada:', error)
    showAlert('Erro ao registrar entrada')
  }
}

async function saida() {
  const qnt = normalizarQuantidade(quantidadeInput.value)

  if (!qnt || qnt <= 0) {
    showAlert('Informe uma quantidade válida')
    return
  }

  const produto = produtos.value.find(
    produto => produto.id === selecionado.value
  )

  if (!produto || !containerSelecionado.value) {
    showAlert('Selecione um produto e um container')
    return
  }

  try {
    if (
      containerSelecionado.value.tipo === 'tanque' &&
      tanqueSelecionado.value
    ) {
      const tanque = tanques.value.find(
        tanque => tanque.id === tanqueSelecionado.value
      )

      if (!tanque) {
        return
      }

      if (qnt > tanque.atual) {
        showAlert(
          `Excede disponível. Atual: ${formatarQuantidade(tanque.atual)}L`
        )

        return
      }

      const novoValor = await updateStorage(
        produto.nome,
        tanque.nome,
        -qnt,
        'tanque'
      )

      tanque.atual = novoValor
    } else if (
      containerSelecionado.value.tipo === 'ibc'
    ) {
      if (!infoIBC.value?.[0]) {
        return
      }

      const atual = parseFloat(infoIBC.value[0][3]) || 0

      if (qnt > atual) {
        showAlert(
          `Excede disponível. Atual: ${formatarQuantidade(atual)}L`
        )

        return
      }

      const novoValor = await updateStorage(
        produto.nome,
        null,
        -qnt,
        'ibc'
      )

      infoIBC.value[0][3] = novoValor
    } else if (
      containerSelecionado.value.tipo === 'bb'
    ) {
      const bb = infoBB.value?.find(
        item => item[1] === containerSelecionado.value.valor
      )

      if (!bb) {
        return
      }

      const atual = parseFloat(bb[3]) || 0

      if (qnt > atual) {
        showAlert(
          `Excede disponível. Atual: ${formatarQuantidade(atual)}L`
        )

        return
      }

      const novoValor = await updateStorage(
        produto.nome,
        bb[1],
        -qnt,
        'bb'
      )

      bb[3] = novoValor
    }

    quantidadeInput.value = ''

    showAlert(
      'Saída registrada com sucesso',
      'success'
    )
  } catch (error) {
    console.error('Erro ao registrar saída:', error)
    showAlert('Erro ao registrar saída')
  }
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
  <main class="flex h-screen w-screen gap-4 p-4" :style="cssVars">
    <!-- PRODUTOS -->
    <div id="search" class="flex-1 p-6 rounded-2xl flex flex-col gap-4" :style="{ background: theme.panelBg }">
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
              ? produtos.find(produto => produto.id === selecionado)?.nome
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
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
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
            <TanqueIcon :size="60" :fillPercent="(tanque.atual / tanque.capacidade) * 100" :color="theme.liquidFill" />

            <span class="text-xs text-center font-medium" :style="{ color: theme.textPrimary }">
              {{ tanque.nome }}
            </span>

            <div class="flex flex-col text-xs text-center">
              <span class="font-bold" :style="{ color: theme.textPrimary }">
                {{ tanque.atual }}L
              </span>

              <span :style="{ color: theme.textMuted }">
                /{{ tanque.capacidade }}L
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

    <!-- CONTROLES -->
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
          }" placeholder="0" @focus="
            quantidadeEmFoco = true;
          limparFormatacaoQuantidade()
            " @input="atualizarQuantidade" @blur="
            quantidadeEmFoco = false;
          formatarQuantidadeAoSair()
            " />

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

    <!-- VISUALIZAÇÃO -->
    <div id="view" class="flex-1 p-6 rounded-2xl flex flex-col items-center justify-center"
      :style="{ background: theme.panelBg }">
      <div v-if="
        containerSelecionado?.tipo === 'tanque' &&
        tanqueSelecionado
      " class="flex flex-col items-center gap-4">
        <span class="text-2xl font-bold" :style="{ color: theme.textPrimary }">
          {{
            tanques.find(
              tanque => tanque.id === tanqueSelecionado
            )?.nome
          }}
        </span>

        <div class="flex items-center gap-6">
          <TanqueIcon :size="160" :fillPercent="(
              tanques.find(
                tanque => tanque.id === tanqueSelecionado
              )?.atual /
              tanques.find(
                tanque => tanque.id === tanqueSelecionado
              )?.capacidade
            ) * 100
            " :color="theme.liquidFill" />

          <div class="flex flex-col text-2xl">
            <span class="font-bold" :style="{ color: theme.textPrimary }">
              {{
                formatarQuantidade(
                  tanques.find(
                    tanque => tanque.id === tanqueSelecionado
                  )?.atual
                )
              }}L
            </span>

            <span :style="{ color: theme.textMuted }">
              /{{
                formatarQuantidade(
                  tanques.find(
                    tanque => tanque.id === tanqueSelecionado
                  )?.capacidade
                )
              }}L
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="
        containerSelecionado?.tipo === 'ibc' &&
        infoIBC
      " class="flex flex-col items-center gap-4 w-full">
        <span class="text-2xl font-bold" :style="{ color: theme.textPrimary }">
          CONTAINER 1000 LITROS
        </span>

        <div class="max-h-72 overflow-y-auto w-full flex justify-center scroll-container px-2">
          <div class="grid grid-cols-5 gap-2 content-start">
            <div v-for="i in unidadesIBC.exibir" :key="i" class="flex items-center justify-center">
              <IBCIcon :size="50" :fillPercent="i <= Math.floor(
                unidadesIBC.valor / unidadesIBC.capacidade
              )
                  ? 100
                  : unidadesIBC.parcial * 100
                " :color="theme.liquidFill" />
            </div>
          </div>
        </div>

        <div class="flex flex-col text-2xl text-center">
          <span class="font-bold" :style="{ color: theme.textPrimary }">
            {{ formatarQuantidade(unidadesIBC.valor) }}L
          </span>

          <span :style="{ color: theme.textMuted }">
            {{ unidadesIBC.total }} unidades
            {{
              unidadesIBC.total > MAX_QUADRADINHOS
                ? ` (${MAX_QUADRADINHOS} visíveis)`
                : ''
            }}
          </span>
        </div>
      </div>

      <div v-else-if="
        containerSelecionado?.tipo === 'bb' &&
        infoBB
      " class="flex flex-col items-center gap-4 w-full">
        <span class="text-2xl font-bold" :style="{ color: theme.textPrimary }">
          BOMBONA {{ containerSelecionado.valor }} LITROS
        </span>

        <div class="max-h-72 overflow-y-auto w-full flex justify-center scroll-container px-2">
          <div class="grid grid-cols-5 gap-2 content-start">
            <div v-for="i in unidadesBB.exibir" :key="i" class="flex items-center justify-center">
              <BombonaIcon :size="50" :fillPercent="i <= Math.floor(
                unidadesBB.valor / unidadesBB.capacidade
              )
                  ? 100
                  : unidadesBB.parcial * 100
                " :color="theme.liquidFill" />
            </div>
          </div>
        </div>

        <div class="flex flex-col text-2xl text-center">
          <span class="font-bold" :style="{ color: theme.textPrimary }">
            {{ formatarQuantidade(unidadesBB.valor) }}L
          </span>

          <span :style="{ color: theme.textMuted }">
            {{ unidadesBB.total }} unidades
            {{
              unidadesBB.total > MAX_QUADRADINHOS
                ? ` (${MAX_QUADRADINHOS} visíveis)`
                : ''
            }}
          </span>
        </div>
      </div>

      <div v-else class="text-center italic">
        <span class="text-xl" :style="{ color: theme.textMuted }">
          Selecione um container para visualizar
        </span>
      </div>
    </div>
  </main>
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
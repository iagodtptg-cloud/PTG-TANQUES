<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { getProductInfo, getProdutos, parseTankRow, parseContainerRow } from './composables/sheetsapi'
import LogoHeader from './LogoHeader.vue'

const allProducts = ref([])
const allTanks = ref([])
const allIBCs = ref([])
const allBBs = ref([])
const filteredContainers = ref([])

const filterProduct = ref('ALL')
const filterStatus = ref('ALL')
const filterType = ref('ALL')
const filterMaterial = ref('ALL')
const sortTanksBy = ref('DEFAULT')
const activeTab = ref('products')
const selectedContainer = ref(null)
const showModal = ref(false)

const isLoading = ref(false)
const loadError = ref('')
const expandedAlertIdx = ref(null)

function toggleAlert(idx) {
  expandedAlertIdx.value = expandedAlertIdx.value === idx ? null : idx
}

function shortAlert(msg, limit = 140) {
  if (msg.length <= limit) return msg
  return msg.slice(0, limit).trimEnd() + '…'
}

const clock = ref('')
let clockInterval = null

// Auto-refresh silencioso dos dados (ms)
const REFRESH_MS = 15000
let refreshInterval = null

// ---------- helpers seguros (números já vêm normalizados do parser) ----------
function toNumber(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function occupancyPct(qty, capacity) {
  if (!capacity || capacity <= 0) return 0
  const p = (qty / capacity) * 100
  return Number.isFinite(p) ? Math.max(0, Math.min(p, 100)) : 0
}

function formatLitros(v) {
  return toNumber(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' L'
}

function formatM3(litros, digits = 1) {
  return (toNumber(litros) / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + ' m³'
}

function formatPct1(p) {
  return Number(p || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }) + '%'
}

const kpis = computed(() => {
  const all = [...allTanks.value, ...allIBCs.value, ...allBBs.value]
  const totalCap = all.reduce((s, c) => s + toNumber(c.capacity), 0)
  const totalQty = all.reduce((s, c) => s + toNumber(c.qty), 0)
  const inStockCount = allTanks.value.filter(t => t.active).length
  const emptyCount = allTanks.value.filter(t => !t.active).length
  const globalPct = totalCap ? (totalQty / totalCap) * 100 : 0

  return [
    { label: 'Produtos', value: allProducts.value.length, icon: '🧪', color: 'blue', sub: `${allProducts.value.filter(p => getProductSummary(p).totalQty > 0).length} com estoque` },
    { label: 'Tanques', value: allTanks.value.length, icon: '🛢️', color: 'purple', sub: `${inStockCount} com estoque` },
    { label: 'IBCs / BBs', value: allIBCs.value.length + allBBs.value.length, icon: '📦', color: 'orange', sub: `${allIBCs.value.length} IBCs · ${allBBs.value.length} BBs` },
    { label: 'Cap. Total', value: formatLitros(totalCap), icon: '🏭', color: 'green', sub: formatM3(totalCap, 0) },
    { label: 'Estoque Atual', value: formatLitros(totalQty), icon: '💧', color: 'yellow', sub: formatM3(totalQty, 1) },
    { label: 'Ocupação Global', value: formatPct1(globalPct), icon: '📊', color: totalQty > 0 ? 'green' : 'red', sub: `${emptyCount} vazios` }
  ]
})

const productSummaries = computed(() => {
  return allProducts.value.map(product => getProductSummary(product))
})

// Tabela de produtos respeita o filtro de produto (filtros de status/tipo valem p/ aba Tanques)
const filteredProductSummaries = computed(() => {
  if (filterProduct.value === 'ALL') return productSummaries.value
  return productSummaries.value.filter(p => p.product === filterProduct.value)
})

const alerts = computed(() => {
  const result = []
  const zeroStockProducts = productSummaries.value.filter(p => p.totalQty === 0 && (p.tanks > 0 || p.ibcs > 0 || p.bbs > 0))
  if (zeroStockProducts.length > 0) {
    result.push({
      type: 'danger',
      icon: '⚠️',
      msg: `${zeroStockProducts.length} produtos com estoque ZERO: ${zeroStockProducts.map(p => p.product).join(', ')}`
    })
  }

  const highUsage = productSummaries.value.filter(p => p.pct > 70 && p.totalQty > 0)
  if (highUsage.length > 0) {
    result.push({
      type: 'warning',
      icon: '⬆️',
      msg: `Tanques com alta ocupação (>70%): ${highUsage.map(p => `${p.product} ${formatPct1(p.pct)}`).join(', ')}`
    })
  }

  const noStorage = allProducts.value.filter(p => ![...allTanks.value, ...allIBCs.value, ...allBBs.value].some(c => c.product === p))
  if (noStorage.length > 0) {
    result.push({
      type: 'muted',
      icon: '❓',
      msg: `Produtos sem armazenamento cadastrado: ${noStorage.join(', ')}`
    })
  }

  return result
})

function getProductSummary(product) {
  const t = allTanks.value.filter(x => x.product === product)
  const i = allIBCs.value.filter(x => x.product === product)
  const b = allBBs.value.filter(x => x.product === product)
  const totalCap = [...t, ...i, ...b].reduce((s, x) => s + toNumber(x.capacity), 0)
  const totalQty = [...t, ...i, ...b].reduce((s, x) => s + toNumber(x.qty), 0)
  const inStock = t.filter(x => x.active).length
  const empty = t.filter(x => !x.active).length
  return {
    product,
    tanks: t.length,
    ibcs: i.length,
    bbs: b.length,
    totalCap,
    totalQty,
    inStock,
    empty,
    pct: totalCap ? (totalQty / totalCap) * 100 : 0
  }
}

// Cores alinhadas aos tokens de dado (visual.md §4)
function getKpiColor(color) {
  const colors = {
    blue: '#2E86F0', // data.volume
    purple: '#B44FD8', // data.forecast
    orange: '#FF8A00', // data.series
    green: '#1ED71E', // data.money
    yellow: '#FFB300', // data.count
    red: '#D32F2F', // data.down
    cyan: '#22C3DC' // data.period
  }
  return colors[color] || '#2E86F0'
}

function getAlertStyle(type) {
  const styles = {
    danger: { borderColor: 'rgba(211, 47, 47, 0.3)', background: 'rgba(211, 47, 47, 0.05)', color: '#ef5350' },
    warning: { borderColor: 'rgba(255, 179, 0, 0.3)', background: 'rgba(255, 179, 0, 0.05)', color: '#ffd54f' },
    info: { borderColor: 'rgba(46, 134, 240, 0.3)', background: 'rgba(46, 134, 240, 0.05)', color: '#64b5f6' },
    muted: { borderColor: 'rgba(166, 171, 173, 0.3)', background: 'rgba(166, 171, 173, 0.05)', color: '#a6abad' }
  }
  return styles[type] || styles.info
}

function getOccupancyColor(pct) {
  const p = Number(pct) || 0
  if (p <= 0) return '#D32F2F'
  if (p < 30) return '#FFB300'
  if (p < 70) return '#2E86F0'
  return '#1ED71E'
}

function getInsightColor(color) {
  const colors = {
    yellow: '#FFB300',
    blue: '#2E86F0',
    purple: '#B44FD8',
    green: '#1ED71E',
    red: '#D32F2F',
    orange: '#FF8A00'
  }
  return colors[color] || '#2E86F0'
}

function getInsightBorder(color) {
  const colors = {
    yellow: 'rgba(255, 179, 0, 0.3)',
    blue: 'rgba(46, 134, 240, 0.3)',
    purple: 'rgba(180, 79, 216, 0.3)',
    green: 'rgba(30, 215, 30, 0.3)',
    red: 'rgba(211, 47, 47, 0.3)',
    orange: 'rgba(255, 138, 0, 0.3)'
  }
  return colors[color] || 'rgba(46, 134, 240, 0.3)'
}

// Cor da variação ativa do recipiente; cai p/ cor de ocupação se não houver variação
function getContainerColor(c) {
  const v = c.variations?.[c.selectedVariation]
  if (v && v.nome) return v.cor
  return getOccupancyColor(occupancyPct(c.qty, c.capacity))
}

function applyFilters() {
  let items = [...allTanks.value, ...allIBCs.value, ...allBBs.value]
  if (filterProduct.value !== 'ALL') {
    items = items.filter(c => c.product === filterProduct.value)
  }
  if (filterStatus.value === 'ACTIVE') {
    items = items.filter(c => c.active)
  } else if (filterStatus.value === 'INACTIVE') {
    items = items.filter(c => !c.active)
  }
  if (filterType.value !== 'ALL') {
    items = items.filter(c => c.storageType === filterType.value)
  }
  if (filterMaterial.value === 'INOX') {
    items = items.filter(c => c.storageType === 'TANQUE' && c.isInox)
  } else if (filterMaterial.value === 'FIBRA') {
    items = items.filter(c => c.storageType === 'TANQUE' && !c.isInox)
  }
  filteredContainers.value = items
}

function tankNumValue(t) {
  const n = parseInt(String(t.num || '').replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

const sortedContainers = computed(() => {
  const arr = [...filteredContainers.value]
  switch (sortTanksBy.value) {
    case 'NUM_ASC':
      return arr.sort((a, b) => {
        const na = tankNumValue(a)
        const nb = tankNumValue(b)
        if (na === null && nb === null) return 0
        if (na === null) return 1
        if (nb === null) return -1
        return na - nb
      })
    case 'NUM_DESC':
      return arr.sort((a, b) => {
        const na = tankNumValue(a)
        const nb = tankNumValue(b)
        if (na === null && nb === null) return 0
        if (na === null) return 1
        if (nb === null) return -1
        return nb - na
      })
    case 'QTY_DESC':
      return arr.sort((a, b) => toNumber(b.qty) - toNumber(a.qty))
    case 'QTY_ASC':
      return arr.sort((a, b) => toNumber(a.qty) - toNumber(b.qty))
    case 'OCC_DESC':
      return arr.sort((a, b) => occupancyPct(b.qty, b.capacity) - occupancyPct(a.qty, a.capacity))
    case 'CAP_DESC':
      return arr.sort((a, b) => toNumber(b.capacity) - toNumber(a.capacity))
    case 'PRODUCT_ASC':
      return arr.sort((a, b) => String(a.product || '').localeCompare(String(b.product || ''), 'pt-BR'))
    default:
      return arr
  }
})

// Guarda o objeto em vez do índice: filtro pode mudar com o modal aberto
function openModal(container) {
  selectedContainer.value = container
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedContainer.value = null
}

function switchTab(tab) {
  activeTab.value = tab
  applyFilters()
}

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

async function loadData(silent = false) {
  if (!silent) {
    isLoading.value = true
    loadError.value = ''
  }
  try {
    const produtosRes = await getProdutos()
    allProducts.value = (produtosRes.values || []).map(v => String(v[0] || '').trim()).filter(Boolean)

    const info = await getProductInfo()

    const tanques = info.INFO_TANQUES || []
    const ibcs = info.INFO_IBC || []
    const bbs = info.INFO_BB || []

    allTanks.value = tanques.map((t, idx) => parseTankRow(t, idx))
    allIBCs.value = ibcs.map((row, idx) => parseContainerRow(row, 'IBC', idx))
    allBBs.value = bbs.map((row, idx) => parseContainerRow(row, 'BB', idx))

    applyFilters()
    if (showModal.value) {
      if (silent && selectedContainer.value) {
        // Reaponta o modal para o objeto novo; fecha se o item sumiu
        const fresh = [...allTanks.value, ...allIBCs.value, ...allBBs.value]
          .find(c => c.id === selectedContainer.value.id)
        if (fresh) {
          selectedContainer.value = fresh
        } else {
          closeModal()
        }
      } else {
        // Recarga manual: o objeto antigo pode não existir mais
        closeModal()
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    if (!silent) {
      loadError.value = 'Não foi possível carregar os dados. Verifique a conexão e tente novamente.'
    }
  } finally {
    if (!silent) {
      isLoading.value = false
    }
  }
}

function computeInsights() {
  const insights = []

  const mostStored = [...productSummaries.value].sort((a, b) => b.totalQty - a.totalQty)[0]
  if (mostStored && mostStored.totalQty > 0) {
    insights.push({
      icon: '👑',
      color: 'yellow',
      title: 'Maior Estoque',
      text: `${mostStored.product} lidera com ${formatLitros(mostStored.totalQty)} (${formatPct1(mostStored.pct)} de ocupação).`
    })
  }

  const largestCap = [...productSummaries.value].sort((a, b) => b.totalCap - a.totalCap)[0]
  if (largestCap) {
    insights.push({
      icon: '🏭',
      color: 'blue',
      title: 'Maior Capacidade Instalada',
      text: `${largestCap.product} possui ${formatLitros(largestCap.totalCap)} em ${largestCap.tanks + largestCap.ibcs + largestCap.bbs} recipientes.`
    })
  }

  const mostTanks = [...productSummaries.value].sort((a, b) => b.tanks - a.tanks)[0]
  if (mostTanks) {
    insights.push({
      icon: '🗂️',
      color: 'purple',
      title: 'Mais Tanques',
      text: `${mostTanks.product} ocupa ${mostTanks.tanks} tanques (${mostTanks.inStock} com estoque, ${mostTanks.empty} vazios).`
    })
  }

  const validProducts = productSummaries.value.filter(p => p.totalCap > 0)
  const avgUtil = validProducts.length > 0 ? validProducts.reduce((s, p) => s + p.pct, 0) / validProducts.length : 0
  const subutilMsg = avgUtil < 30 ? '⚠️ Subutilização detectada.' : 'Dentro da faixa normal.'
  insights.push({
    icon: '📈',
    color: 'green',
    title: 'Utilização Média',
    text: `A ocupação média é de ${formatPct1(avgUtil)}. ${subutilMsg}`
  })

  const emptyProducts = productSummaries.value.filter(p => p.totalQty === 0)
  if (emptyProducts.length > 0 && allProducts.value.length > 0) {
    insights.push({
      icon: '🚫',
      color: 'red',
      title: 'Produtos Sem Estoque',
      text: `${emptyProducts.length} de ${allProducts.value.length} produtos (${((emptyProducts.length / allProducts.value.length) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%) estão vazios.`
    })
  }

  const highOcc = allTanks.value.filter(t => t.capacity > 0 && (t.qty / t.capacity) > 0.85)
  if (highOcc.length > 0) {
    insights.push({
      icon: '🔺',
      color: 'orange',
      title: 'Tanques Quase Cheios (>85%)',
      text: `${highOcc.length} tanque(s) acima de 85% de ocupação. Programar transferência ou consumo.`
    })
  }

  return insights
}

const insights = computed(() => computeInsights())

watch([filterProduct, filterStatus, filterType, filterMaterial], () => applyFilters())

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  loadData()
  refreshInterval = setInterval(() => loadData(true), REFRESH_MS)
})

onBeforeUnmount(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
    clockInterval = null
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})
</script>

<template>
  <div class="min-h-screen" style="background: var(--color-surface-app, #222222); color: var(--color-text-primary, #ffffff)">
    <header class="sticky top-0 z-50 border-b" style="background: rgba(42, 45, 46, 0.9); backdrop-filter: blur(12px); border-color: var(--color-border-subtle, #4A4E50)">
      <div class="w-full px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <nav class="flex items-center gap-2 text-sm justify-start">
          <RouterLink to="/home" class="px-3 py-1.5 rounded-md" style="color: var(--color-text-secondary); background: var(--color-surface-control, #2A2D2E)">Início</RouterLink>
          <RouterLink to="/dash" class="px-3 py-1.5 rounded-md font-semibold" style="color: #fff; background: var(--color-data-volume, #2E86F0)">Dashboard</RouterLink>
        </nav>
        <div class="flex flex-col items-center">
          <LogoHeader class="flex-shrink-0" />
          <p class="text-[10px] italic font-bold tracking-wider" style="color: var(--color-text-muted)">MONITORAMENTO DE TANQUES &amp; ESTOQUE</p>
        </div>
        <div class="flex items-center gap-4 justify-end">
          <div class="hidden sm:flex items-center gap-2 text-xs" style="color: var(--color-text-muted)">
            <span class="w-2 h-2 rounded-full bg-green-400 inline-block" style="animation: pulse 2s infinite"></span>
            Sistema Online
          </div>
          <div class="text-xs hidden sm:block whitespace-nowrap" style="color: var(--color-text-muted)">{{ clock }}</div>
          <button @click="loadData()" :disabled="isLoading" class="p-2 rounded-lg hover:bg-white/5 transition disabled:opacity-50" style="color: var(--color-text-muted)" title="Recarregar dados">
            <span class="text-sm inline-block" :style="{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }">⟳</span>
          </button>
        </div>
      </div>
    </header>

    <main class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <section v-if="isLoading" class="rounded-md p-6 text-center text-sm" style="background: var(--color-surface-panel, #3A3E40); color: var(--color-text-muted)">
        <span class="inline-block mb-2 text-xl" style="animation: spin 0.8s linear infinite">⟳</span>
        <p>Carregando dados da planilha…</p>
      </section>

      <section v-if="loadError" class="rounded-md border px-4 py-3 flex items-center justify-between gap-3 text-sm" style="border-color: rgba(211,47,47,.4); background: rgba(211,47,47,.07); color: #ef5350">
        <span>⚠️ {{ loadError }}</span>
        <button @click="loadData()" class="px-3 py-1.5 rounded-md text-xs font-semibold shrink-0" style="background: #D32F2F; color: #fff">Tentar de novo</button>
      </section>

      <section class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-md p-4 transition-all flex flex-col items-center text-center"
          :style="{
            background: 'var(--color-surface-panel, #3A3E40)',
            border: '1px solid var(--color-border-subtle, #4A4E50)',
            boxShadow: 'var(--shadow-card, 0 4px 10px rgba(0,0,0,.35))'
          }"
        >
          <span class="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2" style="background: var(--color-surface-badge, #2F3233)">{{ kpi.icon }}</span>
          <span class="text-[11px] uppercase tracking-wider font-medium" style="color: var(--color-text-muted)">{{ kpi.label }}</span>
          <div class="text-xl font-bold mt-1 whitespace-nowrap leading-tight" :style="{ color: getKpiColor(kpi.color) }">{{ kpi.value }}</div>
          <div class="text-[10px]" style="color: var(--color-text-muted); margin-top: 4px">{{ kpi.sub }}</div>
        </div>
      </section>

      <section v-if="alerts.length > 0" class="space-y-2">
        <div
          v-for="(alert, idx) in alerts"
          :key="idx"
          class="rounded-md border px-4 py-3 flex items-start gap-3 text-sm"
          :style="getAlertStyle(alert.type)"
        >
          <span class="mt-0.5 shrink-0">{{ alert.icon }}</span>
          <span class="flex-1 min-w-0">{{ expandedAlertIdx === idx || alert.msg.length <= 140 ? alert.msg : shortAlert(alert.msg) }}</span>
          <button
            v-if="alert.msg.length > 140"
            @click="toggleAlert(idx)"
            class="text-xs font-semibold underline underline-offset-2 shrink-0 opacity-80 hover:opacity-100"
          >
            {{ expandedAlertIdx === idx ? 'ver menos' : 'ver mais' }}
          </button>
        </div>
      </section>

      <section class="rounded-md p-4 sm:p-5" style="background: var(--color-surface-panel, #3A3E40); border: 1px solid var(--color-border-subtle, #4A4E50)">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-3">
          <label class="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">
            <span class="italic">🔎 Produto</span>
            <select v-model="filterProduct" class="rounded-md px-3 py-2 text-sm w-full font-normal normal-case tracking-normal" style="background: var(--color-surface-control, #2a2d2e); border: 1px solid var(--color-border-subtle, #4A4E50); color: var(--color-text-secondary)">
              <option value="ALL">Todos os Produtos</option>
              <option v-for="p in allProducts" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">
            <span class="italic">Status</span>
            <select v-model="filterStatus" class="rounded-md px-3 py-2 text-sm w-full font-normal normal-case tracking-normal" style="background: var(--color-surface-control, #2a2d2e); border: 1px solid var(--color-border-subtle, #4A4E50); color: var(--color-text-secondary)">
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Com estoque</option>
              <option value="INACTIVE">Vazios</option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">
            <span class="italic">Tipo</span>
            <select v-model="filterType" class="rounded-md px-3 py-2 text-sm w-full font-normal normal-case tracking-normal" style="background: var(--color-surface-control, #2a2d2e); border: 1px solid var(--color-border-subtle, #4A4E50); color: var(--color-text-secondary)">
              <option value="ALL">Todos os Tipos</option>
              <option value="TANQUE">Tanques</option>
              <option value="IBC">IBCs</option>
              <option value="BB">Bombonas</option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">
            <span class="italic">Material</span>
            <select v-model="filterMaterial" class="rounded-md px-3 py-2 text-sm w-full font-normal normal-case tracking-normal" style="background: var(--color-surface-control, #2a2d2e); border: 1px solid var(--color-border-subtle, #4A4E50); color: var(--color-text-secondary)">
              <option value="ALL">Inox + Fibra</option>
              <option value="INOX">Inox</option>
              <option value="FIBRA">Fibra</option>
            </select>
          </label>
          <div class="flex sm:justify-end">
            <span class="px-3 py-1.5 rounded-full text-xs whitespace-nowrap" style="background: var(--color-surface-badge, #2F3233); color: var(--color-text-muted)">{{ filteredContainers.length }} registros</span>
          </div>
        </div>
      </section>

      <nav class="flex justify-center">
        <div class="inline-flex gap-1 rounded-full p-1.5" style="background: var(--color-surface-panel, #3A3E40); border: 1px solid var(--color-border-subtle, #4A4E50); box-shadow: var(--shadow-card, 0 4px 10px rgba(0,0,0,.35))">
          <button
            @click="switchTab('products')"
            class="px-5 sm:px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
            :style="{
              background: activeTab === 'products' ? 'var(--color-data-volume, #2E86F0)' : 'transparent',
              color: activeTab === 'products' ? 'white' : 'var(--color-text-muted)'
            }"
          >
            Produtos
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" :style="{ background: activeTab === 'products' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-badge, #2F3233)', color: activeTab === 'products' ? 'white' : 'var(--color-text-muted)' }">{{ filteredProductSummaries.length }}</span>
          </button>
          <button
            @click="switchTab('tanks')"
            class="px-5 sm:px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
            :style="{
              background: activeTab === 'tanks' ? 'var(--color-data-volume, #2E86F0)' : 'transparent',
              color: activeTab === 'tanks' ? 'white' : 'var(--color-text-muted)'
            }"
          >
            Tanques
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" :style="{ background: activeTab === 'tanks' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-badge, #2F3233)', color: activeTab === 'tanks' ? 'white' : 'var(--color-text-muted)' }">{{ filteredContainers.length }}</span>
          </button>
          <button
            @click="switchTab('insights')"
            class="px-5 sm:px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
            :style="{
              background: activeTab === 'insights' ? 'var(--color-data-volume, #2E86F0)' : 'transparent',
              color: activeTab === 'insights' ? 'white' : 'var(--color-text-muted)'
            }"
          >
            Percepções
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" :style="{ background: activeTab === 'insights' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-badge, #2F3233)', color: activeTab === 'insights' ? 'white' : 'var(--color-text-muted)' }">{{ insights.length }}</span>
          </button>
        </div>
      </nav>

      <section>

        <div v-if="activeTab === 'products'" class="rounded-md overflow-hidden" style="background: var(--color-surface-panel, #3A3E40); border: 1px solid var(--color-border-subtle, #4A4E50)">
          <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: var(--color-border-divider, #565A5C)">
            <h2 class="text-sm font-bold italic" style="color: var(--color-text-primary, #fff)">PRODUTOS EM ESTOQUE</h2>
            <span class="text-xs" style="color: var(--color-text-muted)">{{ filteredProductSummaries.length }} itens</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[720px]">
              <thead>
                <tr class="border-b" style="border-color: var(--color-border-divider, #565A5C); background: rgba(0, 0, 0, 0.2)">
                  <th class="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium" style="color: var(--color-text-heading, #e6b42a)">Produto</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium hidden md:table-cell" style="color: var(--color-text-heading, #e6b42a)">Tanques</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium hidden md:table-cell" style="color: var(--color-text-heading, #e6b42a)">IBCs</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium hidden md:table-cell" style="color: var(--color-text-heading, #e6b42a)">Bombonas</th>
                  <th class="px-4 py-3 text-right text-xs uppercase tracking-wider font-medium hidden sm:table-cell" style="color: var(--color-text-heading, #e6b42a)">Cap. Total (L)</th>
                  <th class="px-4 py-3 text-right text-xs uppercase tracking-wider font-medium" style="color: var(--color-text-heading, #e6b42a)">Estoque (L)</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--color-text-heading, #e6b42a)">Ocupação</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--color-text-heading, #e6b42a)">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredProductSummaries.length === 0">
                  <td colspan="8" class="px-4 py-8 text-center text-sm" style="color: var(--color-text-muted)">Nenhum produto encontrado para o filtro atual.</td>
                </tr>
                <tr
                  v-for="p in filteredProductSummaries"
                  :key="p.product"
                  class="border-b hover:bg-white/[0.02] transition"
                  style="border-color: rgba(100, 110, 120, 0.3)"
                >
                  <td class="px-4 py-3">
                    <div class="font-medium text-xs" style="color: var(--color-text-primary, #fff)">{{ p.product }}</div>
                    <div v-if="p.empty > 0" class="text-[10px]" style="color: var(--color-text-muted)">{{ p.empty }} tanq. vazio(s)</div>
                  </td>
                  <td class="px-4 py-3 text-center hidden md:table-cell">{{ p.tanks || '—' }}</td>
                  <td class="px-4 py-3 text-center hidden md:table-cell">{{ p.ibcs || '—' }}</td>
                  <td class="px-4 py-3 text-center hidden md:table-cell">{{ p.bbs || '—' }}</td>
                  <td class="px-4 py-3 text-right font-mono hidden sm:table-cell">{{ p.totalCap.toLocaleString('pt-BR') }}</td>
                  <td class="px-4 py-3 text-right font-mono font-semibold" :style="{ color: getOccupancyColor(p.pct) }">{{ p.totalQty.toLocaleString('pt-BR') }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2 justify-center">
                      <div class="w-20 h-2 rounded-full overflow-hidden" style="background: var(--color-surface-raised, #4a4e50)">
                        <div class="h-full rounded-full transition-all" :style="{ width: Math.min(p.pct, 100) + '%', background: getOccupancyColor(p.pct) }"></div>
                      </div>
                      <span class="text-xs font-mono italic font-bold w-14 text-right" :style="{ color: getOccupancyColor(p.pct) }">{{ formatPct1(p.pct) }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span v-if="p.totalQty > 0" class="px-2 py-0.5 rounded-full text-[10px] border" style="background: rgba(46, 204, 113, 0.15); color: #2ecc71; border-color: rgba(46, 204, 113, 0.3)">Em Estoque</span>
                    <span v-else class="px-2 py-0.5 rounded-full text-[10px] border" style="background: rgba(211, 47, 47, 0.15); color: #d32f2f; border-color: rgba(211, 47, 47, 0.3)">Vazio</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'tanks'">
          <div v-if="filteredContainers.length === 0" class="rounded-md p-8 text-center text-sm" style="background: var(--color-surface-panel, #3A3E40); color: var(--color-text-muted)">
            Nenhum recipiente encontrado para os filtros atuais.
          </div>
          <div v-else class="rounded-md p-4" style="background: var(--color-surface-panel, #3A3E40); border: 1px solid var(--color-border-subtle, #4A4E50)">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <h2 class="text-sm font-bold italic" style="color: var(--color-text-primary, #fff)">RECIPIENTES</h2>
              <div class="flex items-center gap-2 sm:ml-auto">
                <label class="text-[11px] uppercase tracking-wider font-medium whitespace-nowrap" style="color: var(--color-text-muted)" for="tank-sort">Ordenar:</label>
                <select id="tank-sort" v-model="sortTanksBy" class="rounded-md px-3 py-1.5 text-xs w-full sm:w-52" style="background: var(--color-surface-control, #2a2d2e); border: 1px solid var(--color-border-subtle, #4A4E50); color: var(--color-text-secondary)">
                  <option value="DEFAULT">Ordem padrão</option>
                  <option value="NUM_ASC">Numeração crescente</option>
                  <option value="NUM_DESC">Numeração decrescente</option>
                  <option value="QTY_DESC">Maior quantidade</option>
                  <option value="QTY_ASC">Menor quantidade</option>
                  <option value="OCC_DESC">Maior ocupação %</option>
                  <option value="CAP_DESC">Maior capacidade</option>
                  <option value="PRODUCT_ASC">Produto A–Z</option>
                </select>
              </div>
            </div>
            <p class="text-xs mb-3" style="color: var(--color-text-muted)">{{ filteredContainers.length }} registros · clique para detalhes</p>
            <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 sm:gap-4">
            <div
              v-for="tank in sortedContainers"
              :key="tank.id"
              @click="openModal(tank)"
              class="rounded-md p-3 sm:p-4 cursor-pointer transition-all hover:-translate-y-0.5"
              :style="{
                background: 'var(--color-surface-panel, #3a3e40)',
                border: `1px solid ${tank.active ? 'var(--color-border-subtle, #4A4E50)' : '#565A5C'}`,
                boxShadow: 'var(--shadow-card, 0 4px 10px rgba(0, 0, 0, 0.35))'
              }"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono uppercase" style="color: var(--color-text-muted)">{{ tank.type }}{{ tank.num ? `-${tank.num}` : '' }}</span>
                <span class="flex items-center gap-1.5">
                  <span
                    v-if="tank.storageType === 'TANQUE'"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    :style="tank.isInox
                      ? { background: 'rgba(34, 195, 220, 0.15)', color: '#22C3DC' }
                      : { background: 'rgba(166, 171, 173, 0.15)', color: '#A6ABAD' }"
                  >{{ tank.isInox ? 'INOX' : 'FIBRA' }}</span>
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{
                      background: tank.active ? '#1ED71E' : '#6b7280',
                      animation: tank.active ? 'pulse 2s infinite' : 'none'
                    }"
                  ></span>
                </span>
              </div>
              <div class="text-[11px] font-semibold truncate mb-2 uppercase" style="color: var(--color-text-primary, #fff)" :title="tank.product">{{ tank.product }}</div>
              <div class="relative w-full h-16 rounded-md overflow-hidden mb-2" :style="{ background: 'var(--color-surface-raised, #4a4e50)' }">
                <div
                  class="absolute bottom-0 w-full transition-all"
                  :style="{
                    height: Math.max(occupancyPct(tank.qty, tank.capacity), 2) + '%',
                    background: getContainerColor(tank),
                    opacity: 0.7
                  }"
                ></div>
                <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                  {{ formatPct1(occupancyPct(tank.qty, tank.capacity)) }}
                </div>
              </div>
              <div class="flex justify-between text-[10px]" style="color: var(--color-text-muted)">
                <span>{{ toNumber(tank.qty).toLocaleString('pt-BR') }} L</span>
                <span>{{ toNumber(tank.capacity).toLocaleString('pt-BR') }} L</span>
              </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'insights'" class="rounded-md p-4" style="background: var(--color-surface-panel, #3A3E40); border: 1px solid var(--color-border-subtle, #4A4E50)">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold italic" style="color: var(--color-text-primary, #fff)">INSIGHTS AUTOMÁTICOS</h2>
            <span class="text-xs" style="color: var(--color-text-muted)">{{ insights.length }} achados</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="insight in insights"
              :key="insight.title"
              class="rounded-md p-4 transition-all"
              :style="{
                background: 'var(--color-surface-panel, #3A3E40)',
                border: `1px solid ${getInsightBorder(insight.color)}`,
                boxShadow: 'var(--shadow-card, 0 4px 10px rgba(0, 0, 0, 0.35))'
              }"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ background: 'var(--color-surface-badge, #2F3233)', color: getInsightColor(insight.color) }">{{ insight.icon }}</span>
                <h4 class="text-sm font-bold italic" style="color: var(--color-text-primary, #fff)">{{ insight.title }}</h4>
              </div>
              <p class="text-xs" style="color: var(--color-text-muted); line-height: 1.5">{{ insight.text }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div
      v-if="showModal && selectedContainer"
      @click.self="closeModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
      style="backdrop-filter: blur(4px)"
    >
      <div class="rounded-md p-6 max-w-md w-full mx-4" style="background: var(--color-surface-panel, #3a3e40); border: 1px solid var(--color-border-subtle, #4A4E50); box-shadow: var(--shadow-card, 0 4px 10px rgba(0, 0, 0, 0.35))">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold" style="color: var(--color-text-primary, #fff)">{{ selectedContainer.type }} {{ selectedContainer.num || '' }}</h3>
          <button @click="closeModal" class="hover:opacity-70 transition" style="color: var(--color-text-muted)">
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-text-muted); width: 80px">Produto:</span>
            <span class="text-sm font-semibold uppercase" style="color: var(--color-text-primary, #fff)">{{ selectedContainer.product }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-text-muted); width: 80px">Tipo:</span>
            <span class="text-sm" style="color: var(--color-text-secondary)">{{ selectedContainer.storageType }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-text-muted); width: 80px">Status:</span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] border"
              :style="selectedContainer.active
                ? { background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.3)' }
                : { background: 'rgba(211, 47, 47, 0.15)', color: '#d32f2f', borderColor: 'rgba(211, 47, 47, 0.3)' }
              "
            >
              {{ selectedContainer.active ? 'COM ESTOQUE' : 'VAZIO' }}
            </span>
          </div>
          <div v-if="selectedContainer.storageType === 'TANQUE'" class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-text-muted); width: 80px">Material:</span>
            <span class="text-sm font-semibold" style="color: var(--color-text-secondary)">{{ selectedContainer.isInox ? 'INOX' : 'FIBRA' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-text-muted); width: 80px">Capacidade:</span>
            <span class="text-sm font-mono" style="color: var(--color-text-secondary)">{{ formatLitros(selectedContainer.capacity) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--color-text-muted); width: 80px">Estoque:</span>
            <span class="text-sm font-mono font-bold" :style="{ color: getOccupancyColor(occupancyPct(selectedContainer.qty, selectedContainer.capacity)) }">
              {{ formatLitros(selectedContainer.qty) }}
            </span>
          </div>

          <div class="mt-3">
            <div
              class="w-full h-4 rounded-full overflow-hidden"
              style="background: var(--color-surface-raised, #4a4e50)"
            >
              <div
                class="h-full rounded-full transition-all"
                :style="{ width: Math.min(occupancyPct(selectedContainer.qty, selectedContainer.capacity), 100) + '%', background: getContainerColor(selectedContainer) }"
              ></div>
            </div>
            <div class="text-center text-xs mt-1 italic font-bold" :style="{ color: getOccupancyColor(occupancyPct(selectedContainer.qty, selectedContainer.capacity)) }">
              {{ formatPct1(occupancyPct(selectedContainer.qty, selectedContainer.capacity)) }} ocupado
            </div>
          </div>

          <div v-if="selectedContainer.variations && selectedContainer.variations.some(v => v.nome)" class="mt-3 pt-3 border-t" style="border-color: var(--color-border-divider, #565A5C)">
            <span class="text-xs italic font-bold" style="color: var(--color-text-muted); display: block; margin-bottom: 8px">VARIAÇÕES DISPONÍVEIS:</span>
            <div class="flex flex-wrap gap-1">
              <template v-for="(variation, vidx) in selectedContainer.variations" :key="vidx">
                <span
                  v-if="variation.nome"
                  class="px-2 py-1 rounded-md text-[10px] font-medium"
                  :style="{
                    background: variation.cor + '22',
                    color: variation.cor,
                    border: `1px solid ${variation.cor}44`,
                    outline: selectedContainer.selectedVariation === vidx ? `2px solid ${variation.cor}` : 'none'
                  }"
                  :title="selectedContainer.selectedVariation === vidx ? 'Variação ativa' : ''"
                >
                  {{ variation.nome }}{{ selectedContainer.selectedVariation === vidx ? ' ●' : '' }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

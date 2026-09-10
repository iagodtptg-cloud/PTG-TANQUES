<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { getProductInfo, getProdutos } from './composables/sheetsapi'
import LogoHeader from './LogoHeader.vue'

const allProducts = ref([])
const allTanks = ref([])
const allIBCs = ref([])
const allBBs = ref([])
const filteredContainers = ref([])

const filterProduct = ref('ALL')
const filterStatus = ref('ALL')
const filterType = ref('ALL')
const activeTab = ref('products')
const selectedTankIdx = ref(null)
const showModal = ref(false)

const clock = ref('')

const kpis = computed(() => {
  const totalCap = [...allTanks.value, ...allIBCs.value, ...allBBs.value].reduce((s, c) => s + c.capacity, 0)
  const totalQty = [...allTanks.value, ...allIBCs.value, ...allBBs.value].reduce((s, c) => s + c.qty, 0)
  const activeCount = allTanks.value.filter(t => t.active).length
  const inactiveCount = allTanks.value.filter(t => !t.active).length
  const globalPct = totalCap ? ((totalQty / totalCap) * 100).toFixed(1) : 0

  return [
    { label: 'Produtos', value: allProducts.value.length, icon: 'fa-flask', color: 'blue', sub: `${allProducts.value.filter(p => getProductSummary(p).totalQty > 0).length} com estoque` },
    { label: 'Tanques', value: allTanks.value.length, icon: 'fa-database', color: 'purple', sub: `${activeCount} ativos` },
    { label: 'IBCs / BBs', value: allIBCs.value.length + allBBs.value.length, icon: 'fa-box', color: 'orange', sub: `${allIBCs.value.length} IBCs · ${allBBs.value.length} BBs` },
    { label: 'Cap. Total', value: (totalCap / 1000).toFixed(0) + 'm³', icon: 'fa-tachometer-alt', color: 'green', sub: totalCap.toLocaleString('pt-BR') + ' L' },
    { label: 'Estoque Atual', value: (totalQty / 1000).toFixed(1) + 'm³', icon: 'fa-water', color: 'yellow', sub: totalQty.toLocaleString('pt-BR') + ' L' },
    { label: 'Ocupação Global', value: globalPct + '%', icon: 'fa-chart-pie', color: totalQty > 0 ? 'green' : 'red', sub: `${inactiveCount} tanques inativos` }
  ]
})

const productSummaries = computed(() => {
  return allProducts.value.map(product => getProductSummary(product))
})

const alerts = computed(() => {
  const result = []
  const zeroStockProducts = productSummaries.value.filter(p => p.totalQty === 0 && (p.tanks > 0 || p.ibcs > 0 || p.bbs > 0))
  if (zeroStockProducts.length > 0) {
    result.push({
      type: 'danger',
      icon: 'fa-exclamation-triangle',
      msg: `${zeroStockProducts.length} produtos com estoque ZERO: ${zeroStockProducts.map(p => p.product).join(', ')}`
    })
  }

  const highUsage = productSummaries.value.filter(p => p.pct > 70 && p.totalQty > 0)
  if (highUsage.length > 0) {
    result.push({
      type: 'warning',
      icon: 'fa-arrow-up',
      msg: `Tanques com alta ocupação (>70%): ${highUsage.map(p => `${p.product} ${p.pct.toFixed(0)}%`).join(', ')}`
    })
  }

  const inactiveWithStock = allTanks.value.filter(t => !t.active && t.qty > 0)
  if (inactiveWithStock.length > 0) {
    result.push({
      type: 'info',
      icon: 'fa-info-circle',
      msg: `${inactiveWithStock.length} tanques INATIVOS ainda possuem estoque (${inactiveWithStock.reduce((s, t) => s + t.qty, 0).toLocaleString('pt-BR')} L)`
    })
  }

  const noStorage = allProducts.value.filter(p => ![...allTanks.value, ...allIBCs.value, ...allBBs.value].some(c => c.product === p))
  if (noStorage.length > 0) {
    result.push({
      type: 'muted',
      icon: 'fa-question-circle',
      msg: `Produtos sem armazenamento cadastrado: ${noStorage.join(', ')}`
    })
  }

  return result
})

function getProductSummary(product) {
  const t = allTanks.value.filter(x => x.product === product)
  const i = allIBCs.value.filter(x => x.product === product)
  const b = allBBs.value.filter(x => x.product === product)
  const totalCap = [...t, ...i, ...b].reduce((s, x) => s + x.capacity, 0)
  const totalQty = [...t, ...i, ...b].reduce((s, x) => s + x.qty, 0)
  const activeTanks = t.filter(x => x.active).length
  const inactiveTanks = t.filter(x => !x.active).length
  return {
    product,
    tanks: t.length,
    ibcs: i.length,
    bbs: b.length,
    totalCap,
    totalQty,
    activeTanks,
    inactiveTanks,
    pct: totalCap ? (totalQty / totalCap) * 100 : 0
  }
}

function getKpiColor(color) {
  const colors = {
    blue: '#4A90E2',
    purple: '#B44FD8',
    orange: '#FF8A00',
    green: '#1ED71E',
    yellow: '#FFC107',
    red: '#D32F2F'
  }
  return colors[color] || '#4A90E2'
}

function getAlertStyle(type) {
  const styles = {
    danger: { borderColor: 'rgba(211, 47, 47, 0.3)', background: 'rgba(211, 47, 47, 0.05)', color: '#ef5350' },
    warning: { borderColor: 'rgba(255, 179, 0, 0.3)', background: 'rgba(255, 179, 0, 0.05)', color: '#ffd54f' },
    info: { borderColor: 'rgba(74, 144, 226, 0.3)', background: 'rgba(74, 144, 226, 0.05)', color: '#64b5f6' },
    muted: { borderColor: 'rgba(166, 171, 173, 0.3)', background: 'rgba(166, 171, 173, 0.05)', color: '#a6abad' }
  }
  return styles[type] || styles.info
}

function getOccupancyColor(pct) {
  if (pct === 0) return '#D32F2F'
  if (pct < 30) return '#FFC107'
  if (pct < 70) return '#4A90E2'
  return '#1ED71E'
}

function getInsightColor(color) {
  const colors = {
    yellow: '#FFC107',
    blue: '#4A90E2',
    purple: '#B44FD8',
    green: '#1ED71E',
    red: '#D32F2F',
    orange: '#FF8A00'
  }
  return colors[color] || '#4A90E2'
}

function getInsightBorder(color) {
  const colors = {
    yellow: 'rgba(255, 193, 7, 0.3)',
    blue: 'rgba(74, 144, 226, 0.3)',
    purple: 'rgba(180, 79, 216, 0.3)',
    green: 'rgba(30, 215, 30, 0.3)',
    red: 'rgba(211, 47, 47, 0.3)',
    orange: 'rgba(255, 138, 0, 0.3)'
  }
  return colors[color] || 'rgba(74, 144, 226, 0.3)'
}

function getGradeColor(grade) {
  const hex = grade.split('_')[1] || 'FFFFFF'
  return '#' + hex
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
  filteredContainers.value = items
}

function openModal(idx) {
  selectedTankIdx.value = idx
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedTankIdx.value = null
}

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'tanks') {
    applyFilters()
  }
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

async function loadData() {
  try {
    const produtosRes = await getProdutos()
    allProducts.value = produtosRes.values.map(v => v[0])

    const info = await getProductInfo()

    const tanques = info.INFO_TANQUES || []
    const ibcs = info.INFO_IBC || []
    const bbs = info.INFO_BB || []

    allTanks.value = tanques.map(t => ({
      product: t[0],
      num: t[1],
      capacity: +t[2],
      type: t[3],
      qty: +t[4],
      active: t[5] === 'TRUE',
      extra: +t[6] || 0,
      grades: (t.slice(7) || []).filter(g => g && g.trim()),
      storageType: 'TANQUE'
    }))

    allIBCs.value = ibcs.map(i => ({
      product: i[0],
      capacity: +i[1],
      type: i[2],
      qty: +i[3],
      active: true,
      storageType: 'IBC'
    }))

    allBBs.value = bbs.map(b => ({
      product: b[0],
      capacity: +b[1],
      type: b[2],
      qty: +b[3],
      active: true,
      storageType: 'BB'
    }))

    applyFilters()
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
  }
}

function generateInsights() {
  const insights = []

  const mostStored = [...productSummaries.value].sort((a, b) => b.totalQty - a.totalQty)[0]
  if (mostStored && mostStored.totalQty > 0) {
    insights.push({
      icon: 'fa-crown',
      color: 'yellow',
      title: 'Maior Estoque',
      text: `${mostStored.product} lidera com ${mostStored.totalQty.toLocaleString('pt-BR')} L (${mostStored.pct.toFixed(1)}% de ocupação).`
    })
  }

  const largestCap = [...productSummaries.value].sort((a, b) => b.totalCap - a.totalCap)[0]
  if (largestCap) {
    insights.push({
      icon: 'fa-warehouse',
      color: 'blue',
      title: 'Maior Capacidade Instalada',
      text: `${largestCap.product} possui ${largestCap.totalCap.toLocaleString('pt-BR')} L em ${largestCap.tanks + largestCap.ibcs + largestCap.bbs} recipientes.`
    })
  }

  const mostTanks = [...productSummaries.value].sort((a, b) => b.tanks - a.tanks)[0]
  if (mostTanks) {
    insights.push({
      icon: 'fa-layer-group',
      color: 'purple',
      title: 'Mais Tanques',
      text: `${mostTanks.product} ocupa ${mostTanks.tanks} tanques (${mostTanks.activeTanks} ativos, ${mostTanks.inactiveTanks} inativos).`
    })
  }

  const validProducts = productSummaries.value.filter(p => p.totalCap > 0)
  const avgUtil = validProducts.length > 0 ? validProducts.reduce((s, p) => s + p.pct, 0) / validProducts.length : 0
  const subutilMsg = avgUtil < 30 ? '⚠️ Subutilização detectada.' : 'Dentro da faixa normal.'
  insights.push({
    icon: 'fa-gauge-high',
    color: 'green',
    title: 'Utilização Média',
    text: `A ocupação média é de ${avgUtil.toFixed(1)}%. ${subutilMsg}`
  })

  const inactiveStock = allTanks.value.filter(t => !t.active && t.qty > 0)
  if (inactiveStock.length > 0) {
    const totalInactiveStock = inactiveStock.reduce((s, t) => s + t.qty, 0)
    insights.push({
      icon: 'fa-triangle-exclamation',
      color: 'red',
      title: 'Estoque em Tanques Inativos',
      text: `${inactiveStock.length} tanques INATIVOS contêm ${totalInactiveStock.toLocaleString('pt-BR')} L. Verificar se devem ser reativados.`
    })
  }

  const emptyProducts = productSummaries.value.filter(p => p.totalQty === 0)
  if (emptyProducts.length > 0) {
    insights.push({
      icon: 'fa-ban',
      color: 'red',
      title: 'Produtos Sem Estoque',
      text: `${emptyProducts.length} de ${allProducts.value.length} produtos (${((emptyProducts.length / allProducts.value.length) * 100).toFixed(0)}%) estão vazios.`
    })
  }

  const highOcc = allTanks.value.filter(t => t.capacity && (t.qty / t.capacity) > 0.85)
  if (highOcc.length > 0) {
    insights.push({
      icon: 'fa-arrow-trend-up',
      color: 'orange',
      title: 'Tanques Quase Cheios (>85%)',
      text: `${highOcc.length} tanque(s) acima de 85% de ocupação. Programar transferência ou consumo.`
    })
  }

  return insights
}

watch([filterProduct, filterStatus, filterType], () => applyFilters())

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
  loadData()
})

onBeforeUnmount(() => {
  if (window._clockInterval) clearInterval(window._clockInterval)
})
</script>

<template>
  <div class="min-h-screen" style="background: var(--surface-app, #222222); color: var(--text-primary, #ffffff)">
    <header class="sticky top-0 z-50 border-b" style="background: rgba(42, 45, 46, 0.7); backdrop-filter: blur(12px); border-color: rgba(74, 144, 226, 0.1)">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center">
            <i class="fas fa-industry text-white text-lg"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold text-white tracking-tight">ChemControl <span class="text-xs font-normal" style="color: var(--text-muted)">v2.0</span></h1>
            <p class="text-[10px]" style="color: var(--text-muted); margin-top: -2px">Monitoramento de Tanques & Estoque</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 text-xs" style="color: var(--text-muted)">
            <span class="w-2 h-2 rounded-full bg-green-400 inline-block" style="animation: pulse 2s infinite"></span>
            Sistema Online
          </div>
          <div class="text-xs" style="color: var(--text-muted)">{{ clock }}</div>
          <button @click="loadData" class="p-2 rounded-lg hover:bg-white/5 transition" style="color: var(--text-muted)">
            <i class="fas fa-sync-alt text-sm"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <section class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-2xl p-4 transition-all"
          :style="{
            background: `linear-gradient(135deg, var(--surface-panel), var(--surface-app))`,
            border: '1px solid rgba(74, 144, 226, 0.15)'
          }"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] uppercase tracking-wider font-medium" style="color: var(--text-muted)">{{ kpi.label }}</span>
            <i :class="`fas ${kpi.icon}`" :style="{ color: getKpiColor(kpi.color) }" class="text-sm"></i>
          </div>
          <div class="text-2xl font-bold">{{ kpi.value }}</div>
          <div class="text-[10px]" style="color: var(--text-muted); margin-top: 4px">{{ kpi.sub }}</div>
        </div>
      </section>

      <section v-if="alerts.length > 0" class="space-y-2">
        <div
          v-for="(alert, idx) in alerts"
          :key="idx"
          class="rounded-xl border px-4 py-3 flex items-start gap-3 text-sm"
          :style="getAlertStyle(alert.type)"
        >
          <i :class="`fas ${alert.icon}`" class="mt-0.5"></i>
          <span>{{ alert.msg }}</span>
        </div>
      </section>

      <section class="rounded-2xl p-4" style="background: var(--surface-panel, #3a3e40); border: 1px solid rgba(74, 144, 226, 0.15)">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div class="flex items-center gap-2 text-sm" style="color: var(--text-muted)">
            <i class="fas fa-filter"></i>
            <span class="font-medium">Filtros:</span>
          </div>
          <select v-model="filterProduct" class="rounded-lg px-3 py-2 text-sm w-full sm:w-64" style="background: var(--surface-control, #2a2d2e); border: 1px solid rgba(74, 144, 226, 0.2); color: var(--text-secondary)">
            <option value="ALL">Todos os Produtos</option>
            <option v-for="p in allProducts" :key="p" :value="p">{{ p }}</option>
          </select>
          <select v-model="filterStatus" class="rounded-lg px-3 py-2 text-sm w-full sm:w-48" style="background: var(--surface-control, #2a2d2e); border: 1px solid rgba(74, 144, 226, 0.2); color: var(--text-secondary)">
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
          <select v-model="filterType" class="rounded-lg px-3 py-2 text-sm w-full sm:w-48" style="background: var(--surface-control, #2a2d2e); border: 1px solid rgba(74, 144, 226, 0.2); color: var(--text-secondary)">
            <option value="ALL">Todos os Tipos</option>
            <option value="TANQUE">Tanques</option>
            <option value="IBC">IBCs</option>
            <option value="BB">Bombonas</option>
          </select>
          <div class="ml-auto flex items-center gap-2">
            <span class="text-xs" style="color: var(--text-muted)">{{ filteredContainers.length }} registros</span>
          </div>
        </div>
      </section>

      <section>
        <div class="flex gap-1 mb-4 rounded-xl p-1 w-fit" style="background: var(--surface-control, #2a2d2e)">
          <button
            @click="switchTab('products')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :style="{
              background: activeTab === 'products' ? 'linear-gradient(135deg, #4A90E2, #357ABD)' : 'transparent',
              color: activeTab === 'products' ? 'white' : 'var(--text-muted)'
            }"
          >
            <i class="fas fa-boxes-stacked mr-1"></i> Produtos
          </button>
          <button
            @click="switchTab('tanks')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :style="{
              background: activeTab === 'tanks' ? 'linear-gradient(135deg, #4A90E2, #357ABD)' : 'transparent',
              color: activeTab === 'tanks' ? 'white' : 'var(--text-muted)'
            }"
          >
            <i class="fas fa-database mr-1"></i> Tanques
          </button>
          <button
            @click="switchTab('insights')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :style="{
              background: activeTab === 'insights' ? 'linear-gradient(135deg, #4A90E2, #357ABD)' : 'transparent',
              color: activeTab === 'insights' ? 'white' : 'var(--text-muted)'
            }"
          >
            <i class="fas fa-lightbulb mr-1"></i> Insights
          </button>
        </div>

        <div v-if="activeTab === 'products'" class="rounded-2xl overflow-hidden" style="background: var(--surface-panel, #3a3e40); border: 1px solid rgba(74, 144, 226, 0.15)">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b" style="border-color: rgba(100, 110, 120, 0.5); background: rgba(0, 0, 0, 0.2)">
                  <th class="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Produto</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Tanques</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">IBCs</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Bombonas</th>
                  <th class="px-4 py-3 text-right text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Cap. Total (L)</th>
                  <th class="px-4 py-3 text-right text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Estoque (L)</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Ocupação</th>
                  <th class="px-4 py-3 text-center text-xs uppercase tracking-wider font-medium" style="color: var(--text-heading, #e6b42a)">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in productSummaries"
                  :key="p.product"
                  class="border-b hover:bg-white/[0.02] transition"
                  style="border-color: rgba(100, 110, 120, 0.3)"
                >
                  <td class="px-4 py-3">
                    <div class="font-medium text-white text-xs">{{ p.product }}</div>
                    <div v-if="p.inactiveTanks > 0" class="text-[10px]" style="color: var(--text-muted)">{{ p.inactiveTanks }} tanq. inativo(s)</div>
                  </td>
                  <td class="px-4 py-3 text-center">{{ p.tanks || '—' }}</td>
                  <td class="px-4 py-3 text-center">{{ p.ibcs || '—' }}</td>
                  <td class="px-4 py-3 text-center">{{ p.bbs || '—' }}</td>
                  <td class="px-4 py-3 text-right font-mono">{{ p.totalCap.toLocaleString('pt-BR') }}</td>
                  <td class="px-4 py-3 text-right font-mono font-semibold" :style="{ color: getOccupancyColor(p.pct) }">{{ p.totalQty.toLocaleString('pt-BR') }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2 justify-center">
                      <div class="w-20 h-2 rounded-full overflow-hidden" style="background: var(--surface-raised, #4a4e50)">
                        <div class="h-full rounded-full transition-all" :style="{ width: Math.min(p.pct, 100) + '%', background: getOccupancyColor(p.pct) }"></div>
                      </div>
                      <span class="text-xs font-mono w-10 text-right" :style="{ color: getOccupancyColor(p.pct) }">{{ p.pct.toFixed(1) }}%</span>
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

        <div v-if="activeTab === 'tanks'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <div
            v-for="(tank, idx) in filteredContainers"
            :key="idx"
            @click="openModal(idx)"
            class="rounded-xl p-3 cursor-pointer transition-all"
            :style="{
              background: 'var(--surface-panel, #3a3e40)',
              border: `1px solid ${tank.active ? 'rgba(74, 144, 226, 0.3)' : 'rgba(100, 110, 120, 0.3)'}`,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)'
            }"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono" style="color: var(--text-muted)">{{ tank.type }}{{ tank.num ? `-${tank.num}` : '' }}</span>
              <span
                class="w-2 h-2 rounded-full"
                :style="{
                  background: tank.active ? '#22c55e' : '#6b7280',
                  animation: tank.active ? 'pulse 2s infinite' : 'none'
                }"
              ></span>
            </div>
            <div class="text-[11px] font-semibold text-white truncate mb-2" :title="tank.product">{{ tank.product }}</div>
            <div class="relative w-full h-16 rounded-lg overflow-hidden mb-2" :style="{ background: 'var(--surface-raised, #4a4e50)' }">
              <div
                class="absolute bottom-0 w-full rounded-b-lg transition-all"
                :style="{
                  height: Math.max((tank.qty / tank.capacity) * 100, 2) + '%',
                  background: getOccupancyColor((tank.qty / tank.capacity) * 100),
                  opacity: 0.7
                }"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                {{ ((tank.qty / tank.capacity) * 100).toFixed(0) }}%
              </div>
            </div>
            <div class="flex justify-between text-[10px]" style="color: var(--text-muted)">
              <span>{{ tank.qty.toLocaleString('pt-BR') }} L</span>
              <span>{{ tank.capacity.toLocaleString('pt-BR') }} L</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'insights'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="insight in generateInsights()"
              :key="insight.title"
              class="rounded-xl p-4 transition-all"
              :style="{
                background: `linear-gradient(135deg, var(--surface-panel), var(--surface-app))`,
                border: `1px solid ${getInsightBorder(insight.color)}`,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)'
              }"
            >
              <div class="flex items-center gap-2 mb-2">
                <i :class="`fas ${insight.icon}`" :style="{ color: getInsightColor(insight.color) }"></i>
                <h4 class="text-sm font-bold text-white">{{ insight.title }}</h4>
              </div>
              <p class="text-xs" style="color: var(--text-muted); line-height: 1.5">{{ insight.text }}</p>
            </div>
          </div>
        </div>
      </section>

      <LogoHeader class="mt-8 mb-4" />
    </main>

    <div
      v-if="showModal && selectedTankIdx !== null"
      @click.self="closeModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
      style="backdrop-filter: blur(4px)"
    >
      <div class="rounded-2xl p-6 max-w-md w-full mx-4" style="background: var(--surface-panel, #3a3e40); border: 1px solid rgba(74, 144, 226, 0.15); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35)">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">{{ filteredContainers[selectedTankIdx]?.type }} {{ filteredContainers[selectedTankIdx]?.num || '' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white transition">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="filteredContainers[selectedTankIdx]" class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--text-muted); width: 80px">Produto:</span>
            <span class="text-sm font-semibold text-white">{{ filteredContainers[selectedTankIdx].product }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--text-muted); width: 80px">Tipo:</span>
            <span class="text-sm" style="color: var(--text-secondary)">{{ filteredContainers[selectedTankIdx].storageType }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--text-muted); width: 80px">Status:</span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] border"
              :style="filteredContainers[selectedTankIdx].active
                ? { background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.3)' }
                : { background: 'rgba(211, 47, 47, 0.15)', color: '#d32f2f', borderColor: 'rgba(211, 47, 47, 0.3)' }
              "
            >
              {{ filteredContainers[selectedTankIdx].active ? 'ATIVO' : 'INATIVO' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--text-muted); width: 80px">Capacidade:</span>
            <span class="text-sm font-mono" style="color: var(--text-secondary)">{{ filteredContainers[selectedTankIdx].capacity.toLocaleString('pt-BR') }} L</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs" style="color: var(--text-muted); width: 80px">Estoque:</span>
            <span class="text-sm font-mono font-bold" :style="{ color: getOccupancyColor((filteredContainers[selectedTankIdx].qty / filteredContainers[selectedTankIdx].capacity) * 100) }">
              {{ filteredContainers[selectedTankIdx].qty.toLocaleString('pt-BR') }} L
            </span>
          </div>

          <div class="mt-3">
            <div
              class="w-full h-4 rounded-full overflow-hidden"
              style="background: var(--surface-raised, #4a4e50)"
            >
              <div
                class="h-full rounded-full transition-all"
                :style="{ width: Math.min((filteredContainers[selectedTankIdx].qty / filteredContainers[selectedTankIdx].capacity) * 100, 100) + '%', background: getOccupancyColor((filteredContainers[selectedTankIdx].qty / filteredContainers[selectedTankIdx].capacity) * 100) }"
              ></div>
            </div>
            <div class="text-center text-xs mt-1" :style="{ color: getOccupancyColor((filteredContainers[selectedTankIdx].qty / filteredContainers[selectedTankIdx].capacity) * 100) }">
              {{ ((filteredContainers[selectedTankIdx].qty / filteredContainers[selectedTankIdx].capacity) * 100).toFixed(1) }}% ocupado
            </div>
          </div>

          <div v-if="filteredContainers[selectedTankIdx].grades && filteredContainers[selectedTankIdx].grades.length > 0" class="mt-3 pt-3 border-t" style="border-color: rgba(100, 110, 120, 0.3)">
            <span class="text-xs" style="color: var(--text-muted); display: block; margin-bottom: 8px">Variações disponíveis:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="grade in filteredContainers[selectedTankIdx].grades"
                :key="grade"
                class="px-2 py-1 rounded-md text-[10px] font-medium"
                :style="{ background: getGradeColor(grade) + '22', color: getGradeColor(grade), border: `1px solid ${getGradeColor(grade)}44` }"
              >
                {{ grade.split('_')[0] }}
              </span>
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
</style>

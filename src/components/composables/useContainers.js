import { ref, computed } from 'vue'
import { getProductInfo } from './sheetsapi'
import { createContainerHandler } from '../containers/containerHandlers'

const tanques = ref([])
const infoIBC = ref(null)
const infoBB = ref(null)

const tanqueSelecionado = ref(null)
const containerSelecionado = ref(null)

const hoveredTanque = ref(null)

export function useContainers() {
  async function carregarDadosProduto(produtoNome) {
    try {
      const data = await getProductInfo(produtoNome)

      tanques.value = (data.INFO_TANQUES || []).map((row, index) => ({
        id: index + 1,
        nome: row[1],
        capacidade: parseFloat(row[2]) || 0,
        atual: parseFloat(row[4]) || 0,
        isInox: row[5]?.toString().toUpperCase() === 'TRUE',
        txCnv: parseFloat(row[6]) || 0
      }))

      infoIBC.value = data.INFO_IBC || null
      infoBB.value = data.INFO_BB || null
    } catch (error) {
      console.error('Erro ao carregar tanques:', error)
      tanques.value = []
      infoIBC.value = null
      infoBB.value = null
      throw error
    }
  }

  function selecionarTanque(id) {
    if (tanqueSelecionado.value === id) {
      tanqueSelecionado.value = null
      containerSelecionado.value = null
      return
    }

    tanqueSelecionado.value = id
    containerSelecionado.value = { tipo: 'tanque' }
  }

  function selecionarIBC() {
    tanqueSelecionado.value = null
    containerSelecionado.value = { tipo: 'ibc' }
  }

  function selecionarBB(capacidade) {
    tanqueSelecionado.value = null
    containerSelecionado.value = { tipo: 'bb', valor: capacidade }
  }

  function limparContainer() {
    tanqueSelecionado.value = null
    containerSelecionado.value = null
  }

  function getHandler(type) {
    return createContainerHandler(type, {
      tanques,
      infoIBC,
      infoBB,
      containerSelecionado,
      updateStorage: null,
      format: (v) => v.toLocaleString('pt-BR'),
      alert: () => {}
    })
  }

  const handler = computed(() => {
    if (!containerSelecionado.value?.tipo) return null
    return createContainerHandler(containerSelecionado.value.tipo, {
      tanques,
      infoIBC,
      infoBB,
      containerSelecionado,
      updateStorage: null,
      format: (v) => v.toLocaleString('pt-BR'),
      alert: () => {}
    })
  })

  return {
    tanques,
    infoIBC,
    infoBB,
    tanqueSelecionado,
    containerSelecionado,
    hoveredTanque,
    carregarDadosProduto,
    selecionarTanque,
    selecionarIBC,
    selecionarBB,
    limparContainer,
    getHandler,
    handler
  }
}
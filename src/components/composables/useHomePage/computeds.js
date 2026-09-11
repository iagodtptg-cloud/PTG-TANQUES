import { computed } from 'vue'
import { MAX_QUADRADINHOS } from './estado'

export function createComputeds(estado) {
  const { produtos, tanques, tanqueSelecionado, infoIBC, infoBB, containerSelecionado, busca, selecionado } = estado

  const tanqueInoxSelecionado = computed(() => {
    if (containerSelecionado.value?.tipo !== 'tanque' || !tanqueSelecionado.value) return false
    const tanque = tanques.value.find(t => t.id === tanqueSelecionado.value)
    return tanque?.isInox || false
  })

  const tituloControles = computed(() => {
    const produto = produtos.value.find(produto => produto.id === selecionado.value)
    if (!produto) return 'Selecione um tanque'

    if (containerSelecionado.value?.tipo === 'tanque') {
      const tanque = tanques.value.find(tanque => tanque.id === tanqueSelecionado.value)
      return tanque ? `${produto.nome} ${tanque.num}` : produto.nome
    }
    if (containerSelecionado.value?.tipo === 'ibc') return `${produto.nome} CONTAINER 1000 LITROS`
    if (containerSelecionado.value?.tipo === 'bb') return `${produto.nome} BOMBONA ${containerSelecionado.value.valor} LITROS`
    return produto.nome
  })

  const produtosFiltrados = computed(() => {
    return produtos.value.filter(produto =>
      produto.nome.toLowerCase().includes(busca.value.toLowerCase())
    )
  })

  const tanquesGrid = computed(() => tanques.value)

  const unidadesIBC = computed(() => {
    if (!infoIBC.value) return { valor: 0, capacidade: 0, total: 0, parcial: 0, exibir: 0 }
    const valorAtual = parseFloat(infoIBC.value[0]?.[3]) || 0
    const capacidade = parseFloat(infoIBC.value[0]?.[1]) || 1000
    const total = Math.ceil(valorAtual / capacidade)
    const parcial = (valorAtual / capacidade) - Math.floor(valorAtual / capacidade)
    return { valor: valorAtual, capacidade, total, parcial, exibir: Math.min(total, MAX_QUADRADINHOS) }
  })

  const unidadesBB = computed(() => {
    if (!infoBB.value || !containerSelecionado.value?.valor) return { valor: 0, capacidade: 0, total: 0, parcial: 0, exibir: 0 }
    const bbSelecionada = infoBB.value.find(bb => bb[1] === containerSelecionado.value.valor)
    if (!bbSelecionada) return { valor: 0, capacidade: 0, total: 0, parcial: 0, exibir: 0 }
    const valorAtual = parseFloat(bbSelecionada[3]) || 0
    const capacidade = parseFloat(bbSelecionada[1]) || 1
    const total = Math.ceil(valorAtual / capacidade)
    const parcial = (valorAtual / capacidade) - Math.floor(valorAtual / capacidade)
    return { valor: valorAtual, capacidade, total, parcial, exibir: Math.min(total, MAX_QUADRADINHOS) }
  })

  return { tanqueInoxSelecionado, tituloControles, produtosFiltrados, tanquesGrid, unidadesIBC, unidadesBB }
}
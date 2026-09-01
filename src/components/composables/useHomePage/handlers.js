export function createHandlers(estado, api) {
  const { produtos, tanques, tanqueSelecionado, infoIBC, infoBB, containerSelecionado, busca, selecionado, dropdownOpen, dropdownRef, quantidadeInput, showAlert } = estado
  const { getProductInfo } = api

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

    const produto = produtos.value.find(produto => produto.id === id)
    if (!produto) return

    try {
      const data = await getProductInfo(produto.nome)
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
    containerSelecionado.value = { tipo: 'tanque' }
  }

  function selecionarIBC() {
    tanqueSelecionado.value = null
    containerSelecionado.value = { tipo: 'ibc' }
  }

  function selecionarBB(value) {
    tanqueSelecionado.value = null
    containerSelecionado.value = { tipo: 'bb', valor: value[1] }
  }

  function onClickOutside(event) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      dropdownOpen.value = false
    }
  }

  return { toggleDropdown, selecionarTanque, limparProduto, selecionarTanqueGrid, selecionarIBC, selecionarBB, onClickOutside }
}
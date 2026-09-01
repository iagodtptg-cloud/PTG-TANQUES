import { normalizarQuantidade } from './formatacao'

export function createBusinessLogic(estado, api) {
  const { produtos, tanques, infoIBC, infoBB, containerSelecionado, tanqueSelecionado, quantidadeInput, selecionado, showAlert } = estado
  const { getProdutos, updateStorage } = api

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
    const produto = produtos.value.find(produto => produto.id === selecionado.value)
    if (!produto || !containerSelecionado.value) {
      showAlert('Selecione um produto e um container')
      return
    }

    try {
      if (containerSelecionado.value.tipo === 'tanque' && tanqueSelecionado.value) {
        const tanque = tanques.value.find(tanque => tanque.id === tanqueSelecionado.value)
        if (!tanque) return

        let litros = qnt
        if (tanque.isInox) {
          if (!tanque.txCnv) {
            showAlert('Tanque inox sem taxa de conversão configurada')
            return
          }
          litros = Math.trunc((qnt * tanque.capacidade) / tanque.txCnv)
        }

        if (tanque.atual + litros > tanque.capacidade) {
          const disponivel = tanque.capacidade - tanque.atual
          showAlert(`Excede capacidade. Disponível: ${disponivel}L`)
          return
        }
        const novoValor = await updateStorage(produto.nome, tanque.nome, litros, 'tanque')
        tanque.atual = novoValor
      } else if (containerSelecionado.value.tipo === 'ibc') {
        if (!infoIBC.value?.[0]) return
        const novoValor = await updateStorage(produto.nome, null, qnt, 'ibc')
        infoIBC.value[0][3] = novoValor
      } else if (containerSelecionado.value.tipo === 'bb') {
        const bb = infoBB.value?.find(item => item[1] === containerSelecionado.value.valor)
        if (!bb) return
        const novoValor = await updateStorage(produto.nome, bb[1], qnt, 'bb')
        bb[3] = novoValor
      }

      quantidadeInput.value = ''
      showAlert('Entrada registrada com sucesso', 'success')
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
    const produto = produtos.value.find(produto => produto.id === selecionado.value)
    if (!produto || !containerSelecionado.value) {
      showAlert('Selecione um produto e um container')
      return
    }

    try {
      if (containerSelecionado.value.tipo === 'tanque' && tanqueSelecionado.value) {
        const tanque = tanques.value.find(tanque => tanque.id === tanqueSelecionado.value)
        if (!tanque) return
        if (qnt > tanque.atual) {
          showAlert(`Excede disponível. Atual: ${tanque.atual}L`)
          return
        }
        const novoValor = await updateStorage(produto.nome, tanque.nome, -qnt, 'tanque')
        tanque.atual = novoValor
      } else if (containerSelecionado.value.tipo === 'ibc') {
        if (!infoIBC.value?.[0]) return
        const atual = parseFloat(infoIBC.value[0][3]) || 0
        if (qnt > atual) {
          showAlert(`Excede disponível. Atual: ${atual}L`)
          return
        }
        const novoValor = await updateStorage(produto.nome, null, -qnt, 'ibc')
        infoIBC.value[0][3] = novoValor
      } else if (containerSelecionado.value.tipo === 'bb') {
        const bb = infoBB.value?.find(item => item[1] === containerSelecionado.value.valor)
        if (!bb) return
        const atual = parseFloat(bb[3]) || 0
        if (qnt > atual) {
          showAlert(`Excede disponível. Atual: ${atual}L`)
          return
        }
        const novoValor = await updateStorage(produto.nome, bb[1], -qnt, 'bb')
        bb[3] = novoValor
      }

      quantidadeInput.value = ''
      showAlert('Saída registrada com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      showAlert('Erro ao registrar saída')
    }
  }

  return { carregarProdutos, entrada, saida }
}
const MAX_QUADRADINHOS = 100

export function createTanqueHandler({ tanques, updateStorage, format }) {
  return {
    type: 'tanque',
    getItems: () => tanques.value,
    findById: (id) => tanques.value.find(t => t.id === id),
    validateEntry: (tanque, qnt) => {
      if (!tanque) return 'Tanque não encontrado'
      let litros = qnt
      if (tanque.isInox) {
        if (!tanque.txCnv) return 'Tanque inox sem taxa de conversão'
        litros = Math.trunc((qnt * tanque.capacidade) / tanque.txCnv)
      }
      if (tanque.atual + litros > tanque.capacidade) {
        return `Excede capacidade. Disponível: ${format(tanque.capacidade - tanque.atual)}L`
      }
      return null
    },
    validateExit: (tanque, qnt) => {
      if (!tanque) return 'Tanque não encontrado'
      if (qnt > tanque.atual) return `Excede disponível. Atual: ${format(tanque.atual)}L`
      return null
    },
    executeEntry: async (produto, tanque, qnt) => {
      let litros = qnt
      if (tanque.isInox) litros = Math.trunc((qnt * tanque.capacidade) / tanque.txCnv)
      return updateStorage(produto.nome, tanque.nome, litros, 'tanque')
    },
    executeExit: async (produto, tanque, qnt) => {
      return updateStorage(produto.nome, tanque.nome, -qnt, 'tanque')
    },
    getDisplayData: (tanque) => ({
      name: tanque.nome,
      fillPercent: (tanque.atual / tanque.capacidade) * 100,
      current: tanque.atual,
      capacity: tanque.capacidade
    }),
    icon: 'TanqueIcon',
    iconSize: 60,
    viewIconSize: 160
  }
}

export function createIBCHandler({ infoIBC, updateStorage, format }) {
  return {
    type: 'ibc',
    getItems: () => infoIBC.value ? [{ id: 'ibc', ...infoIBC.value[0] }] : [],
    validateEntry: () => null,
    validateExit: (_, qnt) => {
      const atual = parseFloat(infoIBC.value?.[0]?.[3]) || 0
      if (qnt > atual) return `Excede disponível. Atual: ${format(atual)}L`
      return null
    },
    executeEntry: async (produto, _, qnt) => updateStorage(produto.nome, null, qnt, 'ibc'),
    executeExit: async (produto, _, qnt) => updateStorage(produto.nome, null, -qnt, 'ibc'),
    getDisplayData: () => {
      const valor = parseFloat(infoIBC.value?.[0]?.[3]) || 0
      const cap = parseFloat(infoIBC.value?.[0]?.[1]) || 1000
      return { fillPercent: Math.min((valor / cap) * 100, 100), current: valor, capacity: cap }
    },
    icon: 'IBCIcon',
    iconSize: 50,
    viewIconSize: 50,
    gridCols: 5,
    maxVisible: MAX_QUADRADINHOS
  }
}

export function createBombonaHandler({ infoBB, updateStorage, format }) {
  return {
    type: 'bb',
    getItems: () => infoBB.value || [],
    findByCapacity: (cap) => infoBB.value?.find(b => b[1] === cap),
    validateEntry: () => null,
    validateExit: (bb, qnt) => {
      const atual = parseFloat(bb?.[3]) || 0
      if (qnt > atual) return `Excede disponível. Atual: ${format(atual)}L`
      return null
    },
    executeEntry: async (produto, bb, qnt) => updateStorage(produto.nome, bb[1], qnt, 'bb'),
    executeExit: async (produto, bb, qnt) => updateStorage(produto.nome, bb[1], -qnt, 'bb'),
    getDisplayData: (bb) => {
      const valor = parseFloat(bb[3]) || 0
      const cap = parseFloat(bb[1]) || 1
      return { fillPercent: Math.min((valor / cap) * 100, 100), current: valor, capacity: cap }
    },
    icon: 'BombonaIcon',
    iconSize: 50,
    viewIconSize: 50,
    gridCols: 5,
    maxVisible: MAX_QUADRADINHOS
  }
}

export function createContainerHandler(type, deps) {
  const factories = {
    tanque: createTanqueHandler,
    ibc: createIBCHandler,
    bb: createBombonaHandler
  }
  return factories[type]?.(deps) ?? null
}
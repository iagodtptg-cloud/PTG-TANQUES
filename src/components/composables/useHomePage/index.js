import { theme, cssVars } from './theme.js'
import { createEstado, MAX_QUADRADINHOS } from './estado.js'
import { createComputeds } from './computeds.js'
import { createHandlers } from './handlers.js'
import { createBusinessLogic } from './business.js'
import { getProductInfo, getProdutos, updateStorage, updateVariacoes } from '../sheetsapi.js'

const api = { getProductInfo, getProdutos, updateStorage, updateVariacoes }

const estado = createEstado()
const computeds = createComputeds(estado)
const handlers = createHandlers(estado, api)
const business = createBusinessLogic(estado, api)

const singleton = {
  theme,
  cssVars,
  ...estado,
  ...computeds,
  ...handlers,
  ...business,
  MAX_QUADRADINHOS
}

export function useHomePage() {
  return singleton
}

export {
  theme,
  cssVars,
  createEstado,
  MAX_QUADRADINHOS,
  createComputeds,
  createHandlers,
  createBusinessLogic
}
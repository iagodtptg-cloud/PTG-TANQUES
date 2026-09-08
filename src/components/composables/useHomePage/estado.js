import { ref } from 'vue'

export const MAX_QUADRADINHOS = 100

export function createEstado() {
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

  function showAlert(msg, type = 'error') {
    alertMsg.value = msg
    alertType.value = type
    clearTimeout(alertTimer)
    alertTimer = setTimeout(() => {
      alertMsg.value = ''
    }, 3000)
  }

  function clearAlert() {
    clearTimeout(alertTimer)
    alertMsg.value = ''
    alertType.value = 'error'
  }

  return {
    produtos,
    tanques,
    tanqueSelecionado,
    infoIBC,
    infoBB,
    containerSelecionado,
    busca,
    dropdownOpen,
    selecionado,
    dropdownRef,
    quantidadeInput,
    quantidadeEmFoco,
    hoveredProduto,
    hoveredTanque,
    alertMsg,
    alertType,
    showAlert,
    clearAlert
  }
}
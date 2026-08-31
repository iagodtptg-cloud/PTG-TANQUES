import { ref } from 'vue'

const alertMsg = ref('')
const alertType = ref('error')
let alertTimer = null

export function useAlert() {
  function showAlert(msg, type = 'error') {
    alertMsg.value = msg
    alertType.value = type

    clearTimeout(alertTimer)

    alertTimer = setTimeout(() => {
      alertMsg.value = ''
    }, 3000)
  }

  function clearAlert() {
    alertMsg.value = ''
    clearTimeout(alertTimer)
  }

  return {
    alertMsg,
    alertType,
    showAlert,
    clearAlert
  }
}
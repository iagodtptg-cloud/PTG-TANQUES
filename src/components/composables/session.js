import { ref, computed } from 'vue'

const TOKEN_KEY = 'google_access_token'
const CLIENT_ID = '193369999399-vkc96fqqphpsok7cg2vhcgsamepo8tpi.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

const accessToken = ref(localStorage.getItem(TOKEN_KEY) || null)
const ready = ref(false)
const initialized = ref(false)
let tokenClient = null
let gisLoaded = false

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  accessToken.value = token
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  accessToken.value = null
}

function loadGis() {
  if (gisLoaded) return Promise.resolve()
  gisLoaded = true
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {},
      })
      ready.value = true
      resolve()
    }
    document.body.appendChild(script)
  })
}

function login() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('GIS not loaded'))
    tokenClient.callback = (response) => {
      if (response.error) return reject(new Error(response.error))
      saveToken(response.access_token)
      resolve(response.access_token)
    }
    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

function silentRefresh() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('GIS not loaded'))
    tokenClient.callback = (response) => {
      if (response.error) {
        clearToken()
        return reject(new Error(response.error))
      }
      saveToken(response.access_token)
      resolve(response.access_token)
    }
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

async function ensureToken() {
  await loadGis()
  if (accessToken.value) return accessToken.value
  const saved = localStorage.getItem(TOKEN_KEY)
  if (saved) {
    try {
      return await silentRefresh()
    } catch {
      return null
    }
  }
  return null
}

async function init() {
  await loadGis()
  initialized.value = true
}

function logout() {
  if (accessToken.value) {
    google.accounts.oauth2.revoke(accessToken.value, () => {})
  }
  clearToken()
}

export function useSession() {
  const hasSession = computed(() => !!accessToken.value)
  return {
    accessToken,
    hasSession,
    ready,
    initialized,
    init,
    login,
    silentRefresh,
    ensureToken,
    logout,
  }
}

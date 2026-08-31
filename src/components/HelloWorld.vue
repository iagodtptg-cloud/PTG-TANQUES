<template>
  <div class="sheets-manager">
    <h2>Integração Google Sheets</h2>
    
    <div v-if="!accessToken" class="auth-section">
      <p>Para ler e escrever, você precisa autorizar o acesso à sua conta do Google.</p>
      <button @click="handleAuthClick" class="btn-auth">🔐 Login com Google</button>
    </div>

    <div v-else class="actions-section">
      <div class="write-section">
        <h3>1. Escrever na Coluna A</h3>
        <input v-model="inputValue" type="text" placeholder="Digite um valor..." @keyup.enter="writeData" />
        <button @click="writeData" :disabled="isLoading">Adicionar</button>
      </div>

      <div class="read-section">
        <h3>2. Ler da Coluna B</h3>
        <button @click="getProdutostod(accessToken)" :disabled="isLoading">🔄 Atualizar Leitura</button>
        <div class="result">
          <strong>Dados lidos:</strong>
          <pre>{{ readValue }}</pre>
        </div>
      </div>
    </div>
    
    <p v-if="isLoading" class="loading">Processando...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSession } from './composables/session.js'
import { apiFetch } from './composables/sheetsapi.js'

const SPREADSHEET_ID = '1oCjR7KnvsWDojsiaMS8ymtjGZlCdFk2CcURXUwz5MDQ'
const SHEET_NAME = 'Página1'

const { accessToken, hasSession, init, login } = useSession()

const inputValue = ref('')
const readValue = ref('Nenhum dado lido ainda.')
const isLoading = ref(false)

onMounted(async () => {
  await init()
  if (hasSession.value) readData()
})

async function handleAuthClick() {
  try {
    await login()
  } catch (e) {
    console.error('Erro na autenticação:', e)
    alert('Falha ao autenticar com o Google.')
  }
}

async function readData() {
  if (!accessToken.value) return
  isLoading.value = true
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/INFO_BB!A1:A1000`
    const response = await apiFetch(url)
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler')
    const data = await response.json()
    readValue.value = data.values ? data.values.flat().join('\n') : 'Coluna B vazia.'
  } catch (error) {
    console.error('Erro na leitura:', error)
    readValue.value = `Erro: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

async function writeData() {
  if (!accessToken.value || !inputValue.value.trim()) return
  isLoading.value = true
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
    const body = { values: [[inputValue.value.trim()]] }
    const response = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao escrever')
    inputValue.value = ''
    alert('Valor adicionado com sucesso na Coluna A!')
    await readData()
  } catch (error) {
    console.error('Erro na escrita:', error)
    alert(`Erro ao escrever: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.sheets-manager { font-family: sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
.auth-section, .actions-section { margin-top: 20px; }
input { padding: 8px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 8px 15px; background-color: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { background-color: #aaa; cursor: not-allowed; }
.btn-auth { background-color: #DB4437; }
.result { margin-top: 15px; background: #f4f4f4; padding: 10px; border-radius: 4px; min-height: 50px; white-space: pre-wrap; }
.loading { color: #666; font-style: italic; }
</style>
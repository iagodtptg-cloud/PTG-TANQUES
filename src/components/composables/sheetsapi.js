import { useSession } from './session.js'

const TEST_MODE = import.meta.env.DEV
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID

// Mock carregado dinamicamente só em dev — nunca entra no bundle de prod.
async function loadMockData() {
  return import('../../testeData.js')
}

function assertSpreadsheetId() {
  if (!SPREADSHEET_ID) {
    throw new Error('VITE_GOOGLE_SPREADSHEET_ID não configurado. Defina no .env / Netlify Env.')
  }
}

// ---------- parser compartilhado (fonte única da verdade) ----------
// Layout INFO_TANQUES: [0]product [1]num [2]capacity [3]type [4]qty
//   [5]isInox('TRUE') [6]txCnv [7..9]variations "Name_hex" [10]selectedVariation
// Layout INFO_IBC/INFO_BB: [0]product [1]capacity [2]type [3]qty
// Regras: nomes de campo em inglês, active = qty > 0, isInox só existe p/ TANQUE.

function toQtyNumber(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function parseIsInox(v) {
  return String(v ?? '').trim().toUpperCase() === 'TRUE'
}

export function parseVariation(raw) {
  const text = String(raw ?? '').trim()
  if (text && text.includes('_')) {
    const [nome, cor] = text.split('_')
    const hex = /^[0-9A-Fa-f]{6}$/.test(cor || '') ? cor : '22C3DC'
    if (nome) return { nome, cor: `#${hex}` }
  }
  return { nome: '', cor: '#22c3dc' }
}

export function parseTankRow(row, index = 0) {
  const capacity = toQtyNumber(row[2])
  const qty = toQtyNumber(row[4])
  const isInox = parseIsInox(row[5])
  const txCnv = toQtyNumber(row[6])
  const variations = [parseVariation(row[7]), parseVariation(row[8]), parseVariation(row[9])]
  const selectedVariation = Math.min(Math.max(parseInt(row[10]) || 0, 0), 2)
  const num = String(row[1] ?? '').trim()
  const type = String(row[3] ?? '').trim()
  return {
    id: `${type || 'TQ'}-${num || index + 1}`,
    product: String(row[0] ?? '').trim(),
    num,
    capacity,
    type,
    qty,
    isInox,
    txCnv,
    realCapacity: isInox && txCnv ? txCnv * capacity : capacity,
    active: qty > 0,
    variations,
    selectedVariation,
    storageType: 'TANQUE'
  }
}

export function parseContainerRow(row, storageType, index = 0) {
  const capacity = toQtyNumber(row[1])
  const qty = toQtyNumber(row[3])
  const type = String(row[2] ?? '').trim()
  return {
    id: `${type || storageType}-${index + 1}`,
    product: String(row[0] ?? '').trim(),
    num: '',
    capacity,
    type,
    qty,
    isInox: false,
    txCnv: 0,
    realCapacity: capacity,
    active: qty > 0,
    variations: [],
    selectedVariation: 0,
    storageType
  }
}

export async function apiFetch(url, options = {}) {
    if (TEST_MODE) {
        const { API_A2A } = await loadMockData()
        return new Response(JSON.stringify(API_A2A), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    }
    const { accessToken, silentRefresh } = useSession()
    const res = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${accessToken.value}` },
    })
    if (res.status === 401) {
        await silentRefresh()
        return fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${accessToken.value}` },
        })
    }
    return res
}

export async function getProdutos() {
    if (TEST_MODE) {
        const { API_A2A } = await loadMockData()
        return API_A2A
    }
    assertSpreadsheetId()
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/API!A2:A`
    const response = await apiFetch(url)
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler')
    return response.json()
}

export async function getProductInfo(produto) {
    let data

    if (TEST_MODE) {
        const { INFOTANQUES } = await loadMockData()
        data = INFOTANQUES
    } else {
        assertSpreadsheetId()
        const abas = ['INFO_TANQUES!A2:Z', 'INFO_IBC!A2:Z', 'INFO_BB!A2:Z']

        const params = new URLSearchParams()
        abas.forEach(aba => params.append('ranges', aba))

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${params.toString()}`

        const response = await apiFetch(url)
        if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler abas')

        data = await response.json()
    }

    const resultados = {}
    data.valueRanges.forEach(item => {
        const nomeAba = item.range.split('!')[0].replace(/'/g, '')
        const rows = item.values || []
        resultados[nomeAba] = produto
            ? rows.filter(row => row[0]?.toUpperCase() === produto.toUpperCase())
            : rows
    })

    return resultados
}

export async function updateStorage(prod, deriv, qnt, tipo = 'tanque', valorAtualLocal = 0) {
    if (TEST_MODE) return valorAtualLocal + qnt
    assertSpreadsheetId()
    const config = {
        tanque: { aba: 'INFO_TANQUES', coluna: 'E', colIndex: 4, match: (row) => row[0]?.toUpperCase() === prod.toUpperCase() && row[1]?.toUpperCase() === deriv.toUpperCase() },
        ibc: { aba: 'INFO_IBC', coluna: 'D', colIndex: 3, match: (row) => row[0]?.toUpperCase() === prod.toUpperCase() },
        bb: { aba: 'INFO_BB', coluna: 'D', colIndex: 3, match: (row) => row[0]?.toUpperCase() === prod.toUpperCase() && row[1] === deriv }
    }

    const cfg = config[tipo]
    if (!cfg) throw new Error('Tipo inválido')

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${cfg.aba}!A2:Z`
    const response = await apiFetch(url)
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler planilha')

    const data = await response.json()
    const rows = data.values || []

    const rowIndex = rows.findIndex(cfg.match)
    if (rowIndex === -1) throw new Error('Registro não encontrado')

    const valorAtual = parseFloat(rows[rowIndex][cfg.colIndex]) || 0
    const novoValor = valorAtual + qnt
    const range = `${cfg.aba}!${cfg.coluna}${rowIndex + 2}`

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`
    const updateResponse = await apiFetch(updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [[novoValor]] })
    })

    if (!updateResponse.ok) throw new Error((await updateResponse.json()).error?.message || 'Erro ao atualizar')

    await registerMovement(prod, deriv, qnt, tipo)

    return novoValor
}

export async function updateVariacoes(prod, deriv, variations, selectedVariation) {
    if (TEST_MODE) return
    assertSpreadsheetId()
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/INFO_TANQUES!A2:Z`
    const response = await apiFetch(url)
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler planilha')

    const data = await response.json()
    const rows = data.values || []

    const rowIndex = rows.findIndex(row => 
        row[0]?.toUpperCase() === prod.toUpperCase() && 
        row[1]?.toUpperCase() === deriv.toUpperCase()
    )
    if (rowIndex === -1) throw new Error('Registro não encontrado')

    const variacaoValues = variations.map(v =>
        v.nome ? `${v.nome}_${v.cor.replace('#', '')}` : ''
    )

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/INFO_TANQUES!H${rowIndex + 2}:K${rowIndex + 2}?valueInputOption=USER_ENTERED`
    const updateResponse = await apiFetch(updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [[...variacaoValues, selectedVariation]] })
    })

    if (!updateResponse.ok) throw new Error((await updateResponse.json()).error?.message || 'Erro ao atualizar variações')
}

async function registerMovement(prod, deriv, qnt, tipo) {
    const now = new Date()
    const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`

    let derivacao = ''
    if (tipo === 'tanque') derivacao = 'TANQUE ' + deriv.toUpperCase()
    else if (tipo === 'ibc') derivacao = 'IBC'
    else if (tipo === 'bb') derivacao = `BOMBONA ${deriv}`

    const tipoMov = qnt > 0 ? 'ENTRADA' : 'SAIDA'

    const row = [dataHora, prod.toUpperCase(), derivacao, tipoMov, Math.abs(qnt)]
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/MOVIMENTACOES!A:E:append?valueInputOption=USER_ENTERED`
    const appendResponse = await apiFetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [row] })
    })

    if (!appendResponse.ok) {
        const err = await appendResponse.json()
        console.error('Erro ao registrar movimentação:', err.error?.message || 'Erro desconhecido')
    }
}

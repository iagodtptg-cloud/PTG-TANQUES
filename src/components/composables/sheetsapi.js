import { useSession } from './session.js'

const SPREADSHEET_ID = '1oCjR7KnvsWDojsiaMS8ymtjGZlCdFk2CcURXUwz5MDQ'

export async function apiFetch(url, options = {}) {
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
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/API!A2:A`
    const response = await apiFetch(url)
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler')
    return response.json()
}

export async function getProductInfo(produto) {
    const abas = ['INFO_TANQUES!A2:Z', 'INFO_IBC!A2:Z', 'INFO_BB!A2:Z']

    const params = new URLSearchParams()
    abas.forEach(aba => params.append('ranges', aba))

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${params.toString()}`

    const response = await apiFetch(url)
    if (!response.ok) throw new Error((await response.json()).error?.message || 'Erro ao ler abas')

    const data = await response.json()

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

export async function updateStorage(prod, deriv, qnt, tipo = 'tanque') {
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

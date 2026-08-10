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
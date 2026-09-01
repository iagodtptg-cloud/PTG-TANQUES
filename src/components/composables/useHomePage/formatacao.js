import { nextTick } from 'vue'

export function formatarQuantidade(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return ''
  }
  const numero = Number(valor)
  if (Number.isNaN(numero)) {
    return ''
  }
  return numero.toLocaleString('pt-BR', {
    useGrouping: true,
    maximumFractionDigits: 3
  })
}

export function normalizarQuantidade(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 0
  }
  const texto = String(valor).trim().replace(/\./g, '').replace(',', '.')
  const numero = Number(texto)
  return Number.isFinite(numero) ? numero : 0
}

export function formatarDuranteDigitacao(event, quantidadeInput) {
  const input = event.target
  const valorOriginal = input.value
  const posicaoCursor = input.selectionStart || 0

  const textoAntesCursor = valorOriginal.slice(0, posicaoCursor)
  const quantidadeDigitosAntes = textoAntesCursor.replace(/\D/g, '').length
  const possuiVirgula = valorOriginal.includes(',')

  let [parteInteira = '', parteDecimal = ''] = valorOriginal.split(',')
  parteInteira = parteInteira.replace(/\D/g, '')
  parteDecimal = parteDecimal.replace(/\D/g, '').slice(0, 3)

  if (parteInteira === '' && !possuiVirgula) {
    quantidadeInput.value = ''
    nextTick(() => input.setSelectionRange(0, 0))
    return
  }

  if (parteInteira === '') {
    parteInteira = '0'
  }
  parteInteira = parteInteira.replace(/^0+(?=\d)/, '')

  const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  let valorFormatado = parteInteiraFormatada
  if (possuiVirgula) {
    valorFormatado += `,${parteDecimal}`
  }

  quantidadeInput.value = valorFormatado

  nextTick(() => {
    let novaPosicaoCursor = 0
    let digitosEncontrados = 0

    for (let index = 0; index < valorFormatado.length; index++) {
      if (/\d/.test(valorFormatado[index])) {
        digitosEncontrados++
        if (digitosEncontrados === quantidadeDigitosAntes) {
          novaPosicaoCursor = index + 1
          break
        }
      }
    }

    if (quantidadeDigitosAntes === 0) {
      novaPosicaoCursor = 0
    }

    const virgulaAntesCursor = textoAntesCursor.includes(',')
    if (virgulaAntesCursor && parteDecimal.length === 0) {
      novaPosicaoCursor = valorFormatado.indexOf(',') + 1
    }

    input.setSelectionRange(novaPosicaoCursor, novaPosicaoCursor)
  })
}

export function formatarQuantidadeAoSair(quantidadeInput) {
  const valor = normalizarQuantidade(quantidadeInput.value)
  quantidadeInput.value = valor > 0 ? formatarQuantidade(valor) : ''
}
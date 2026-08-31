import { ref, computed } from 'vue'
import { getProdutos } from './sheetsapi'

const produtos = ref([])
const selecionado = ref(null)
const busca = ref('')
const dropdownOpen = ref(false)
const hoveredProduto = ref(null)
const dropdownRef = ref(null)

export function useProducts() {
  async function carregarProdutos() {
    try {
      const data = await getProdutos()

      produtos.value = (data.values || []).map((row, index) => ({
        id: index + 1,
        nome: row[0]
      }))
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      throw error
    }
  }

  function selecionarProduto(id) {
    selecionado.value = id
    busca.value = ''
    dropdownOpen.value = false
  }

  function limparProduto() {
    selecionado.value = null
    busca.value = ''
    dropdownOpen.value = false
  }

  function toggleDropdown() {
    dropdownOpen.value = !dropdownOpen.value
  }

  function onClickOutside(event) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      dropdownOpen.value = false
    }
  }

  const produtosFiltrados = computed(() => {
    return produtos.value.filter(produto =>
      produto.nome.toLowerCase().includes(busca.value.toLowerCase())
    )
  })

  return {
    produtos,
    selecionado,
    busca,
    dropdownOpen,
    hoveredProduto,
    dropdownRef,
    produtosFiltrados,
    carregarProdutos,
    selecionarProduto,
    limparProduto,
    toggleDropdown,
    onClickOutside
  }
}
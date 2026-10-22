import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { bookService } from '@/services/bookService'
import { categoryService } from '@/services/categoryService'
import { BookMapper } from '@/models/BookMapper'
import { useLayoutStore } from '@/stores/useLayoutStore'
import { useToast } from '@/composables/useToast'

export const useBookStore = defineStore('books', () => {
  // Estado Reactivo
  const books = ref([])
  const categories = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const error = ref(null)

  // Filtros reactivos
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const stockFilter = ref('all') // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

  // Paginación
  const currentPage = ref(1)
  const itemsPerPage = ref(8)

  const toast = useToast()
  const layout = useLayoutStore()

  // Colección filtrada por término de búsqueda,
  // categoría seleccionada y estado de stock
  const filteredBooks = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const cat = selectedCategory.value
    const stockStatus = stockFilter.value

    return books.value.filter((book) => {
      // 1. Filtro por categoría
      if (cat !== 'all' && Number(book.categoryId) !== Number(cat)) {
        return false
      }

      // 2. Filtro por estado de stock
      if (stockStatus !== 'all') {
        if (stockStatus === 'in_stock' && book.stockStatus?.code !== 'IN_STOCK') return false
        if (stockStatus === 'low_stock' && book.stockStatus?.code !== 'LOW_STOCK') return false
        if (stockStatus === 'out_of_stock' && book.stockStatus?.code !== 'OUT_OF_STOCK')
          return false
      }

      // 3. Filtro textual (título, autor o ISBN)
      if (q) {
        const text = `${book.title} ${book.author} ${book.isbn}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      return true
    })
  })

  //Total de páginas calculado según los resultados filtrados
  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredBooks.value.length / itemsPerPage.value))
  })

  //Subconjunto de libros a mostrar en la página actual
  const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredBooks.value.slice(start, start + itemsPerPage.value)
  })

  //Métricas y contadores de stock
  const stats = computed(() => {
    let lowStock = 0
    let outOfStock = 0
    let inStock = 0

    books.value.forEach((b) => {
      if (b.stock <= 0) outOfStock++
      else if (b.stock <= b.minStock) lowStock++
      else inStock++
    })

    return {
      total: books.value.length,
      lowStock,
      outOfStock,
      inStock,
    }
  })

  //Valida los datos de un libro antes de enviar a la API
  function validateBook(data) {
    if (!data.title || !data.title.trim()) {
      return 'El título del libro es obligatorio.'
    }
    if (!data.author || !data.author.trim()) {
      return 'El nombre del autor es obligatorio.'
    }
    const price = Number(data.price)
    if (isNaN(price) || price <= 0) {
      return 'El precio debe ser un número mayor a 0 Bs.'
    }
    const stock = Number(data.stock)
    if (isNaN(stock) || stock < 0) {
      return 'El stock debe ser un número mayor o igual a 0.'
    }
    if (!data.categoryId) {
      return 'Debe seleccionar una categoría válida.'
    }
    return null
  }

  //Acciones Asíncronas
  //Carga los libros desde la API y actualiza los contadores de la barra lateral
  async function fetchBooks() {
    isLoading.value = true
    error.value = null
    try {
      const data = await bookService.getAll({ limit: 8, offset: 0 })
      books.value = BookMapper.toDomainList(data, 8)

      layout.setBadges({ libros: books.value.length })
    } catch (err) {
      error.value = 'No se pudo cargar el catálogo de libros.'
      toast.error('Error al conectar con la API para obtener libros.')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  //Carga las categorías para selectores y filtros
  async function fetchCategories() {
    try {
      const data = await categoryService.getAll()
      categories.value = data || []
    } catch (err) {
      console.warn('Error al cargar categorías:', err)
    }
  }

  //Registra un nuevo libro mediante POST
  async function createBook(bookData) {
    const validationError = validateBook(bookData)
    if (validationError) {
      toast.error(validationError)
      throw new Error(validationError)
    }

    isSaving.value = true
    try {
      const payload = BookMapper.toApi(bookData)
      const createdApi = await bookService.create(payload)

      const newBook = BookMapper.toDomain(createdApi)

      const foundCat = categories.value.find((c) => Number(c.id) === Number(bookData.categoryId))
      if (foundCat) {
        newBook.categoryName = foundCat.name
        newBook.category = foundCat
      }

      // Agrega al inicio de la lista
      books.value.unshift(newBook)
      layout.setBadges({ libros: books.value.length })
      toast.success(`"${newBook.title}" registrado con éxito en el catálogo.`)
      return newBook
    } catch (err) {
      toast.error('No se pudo registrar el libro en la API.')
      console.error(err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  //Actualiza un libro existente mediante PUT
  async function updateBook(id, bookData) {
    const validationError = validateBook(bookData)
    if (validationError) {
      toast.error(validationError)
      throw new Error(validationError)
    }

    isSaving.value = true
    try {
      const payload = BookMapper.toApi(bookData)
      const updatedApi = await bookService.update(id, payload)
      const updatedBook = BookMapper.toDomain(updatedApi)

      const index = books.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        const foundCat = categories.value.find((c) => Number(c.id) === Number(bookData.categoryId))
        if (foundCat) {
          updatedBook.categoryName = foundCat.name
          updatedBook.category = foundCat
        }
        books.value[index] = updatedBook
      }

      toast.success(`"${updatedBook.title}" actualizado con éxito.`)
      return updatedBook
    } catch (err) {
      toast.error('No se pudo actualizar el libro en la API.')
      console.error(err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  //Elimina un libro mediante DELETE
  async function deleteBook(id) {
    isDeleting.value = true
    try {
      await bookService.delete(id)
      const bookToDelete = books.value.find((b) => b.id === id)
      const title = bookToDelete ? bookToDelete.title : 'Libro'

      books.value = books.value.filter((b) => b.id !== id)
      layout.setBadges({ libros: books.value.length })

      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
      }

      toast.success(`"${title}" eliminado del catálogo.`)
    } catch (err) {
      toast.error('No se pudo eliminar el libro en la API.')
      console.error(err)
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  //Control de Filtros y Paginación
  function setSearch(query) {
    searchQuery.value = query
    currentPage.value = 1
  }

  function setCategory(categoryId) {
    selectedCategory.value = categoryId
    currentPage.value = 1
  }

  function setStockFilter(status) {
    stockFilter.value = status
    currentPage.value = 1
  }

  function setPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedCategory.value = 'all'
    stockFilter.value = 'all'
    currentPage.value = 1
  }

  return {
    // Estado
    books,
    categories,
    isLoading,
    isSaving,
    isDeleting,
    error,
    searchQuery,
    selectedCategory,
    stockFilter,
    currentPage,
    itemsPerPage,

    // Getters
    filteredBooks,
    paginatedBooks,
    totalPages,
    stats,

    // Acciones
    fetchBooks,
    fetchCategories,
    createBook,
    updateBook,
    deleteBook,
    setSearch,
    setCategory,
    setStockFilter,
    setPage,
    resetFilters,
  }
})

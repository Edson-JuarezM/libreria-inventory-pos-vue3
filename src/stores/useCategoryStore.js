import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { categoryService } from '@/services/categoryService'
import { categoryErrorMessage, validateCategory } from '@/models/Category'
import { useLayoutStore } from '@/stores/useLayoutStore'
import { useToast } from '@/composables/useToast'

const normalize = (value) =>
  (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const error = ref(null)
  const searchQuery = ref('')

  const layout = useLayoutStore()
  const toast = useToast()

  const filteredCategories = computed(() => {
    const query = normalize(searchQuery.value)
    if (!query) return categories.value

    return categories.value.filter((category) => normalize(category.name).includes(query))
  })

  const stats = computed(() => ({
    total: categories.value.length,
    totalBooks: categories.value.reduce((sum, category) => sum + (category.productCount || 0), 0),
    results: filteredCategories.value.length,
  }))

  async function fetchCategories() {
    isLoading.value = true
    error.value = null

    try {
      const list = await categoryService.getAll()
      const categoriesWithCounts = await Promise.all(
        list.map(async (category) => {
          try {
            const products = await categoryService.getProducts(category.id)
            return { ...category, productCount: products.length }
          } catch {
            return category
          }
        }),
      )

      categories.value = categoriesWithCounts
      layout.setBadges({ categorias: categoriesWithCounts.length })
    } catch (err) {
      error.value = 'No se pudo cargar el catálogo de categorías.'
      toast.error('Error al conectar con la API para obtener categorías.')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(categoryData) {
    const validationError = validateCategory(categoryData)
    if (validationError) {
      toast.error(validationError)
      throw new Error(validationError)
    }

    isSaving.value = true
    try {
      const created = await categoryService.create(categoryData)
      const newCategory = { ...created, productCount: 0 }

      categories.value.unshift(newCategory)
      layout.setBadges({ categorias: categories.value.length })
      toast.success(`Categoría "${newCategory.name}" creada con éxito.`)
      return newCategory
    } catch (err) {
      toast.error(categoryErrorMessage(err, 'No se pudo crear la categoría.'))
      console.error(err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateCategory(id, categoryData) {
    const validationError = validateCategory(categoryData)
    if (validationError) {
      toast.error(validationError)
      throw new Error(validationError)
    }

    isSaving.value = true
    try {
      const updated = await categoryService.update(id, categoryData)
      const index = categories.value.findIndex((category) => category.id === id)

      if (index !== -1) {
        categories.value[index] = {
          ...updated,
          productCount: categories.value[index].productCount,
        }
      }

      toast.success(`Categoría "${updated.name}" actualizada con éxito.`)
      return updated
    } catch (err) {
      toast.error(categoryErrorMessage(err, 'No se pudo actualizar la categoría.'))
      console.error(err)
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteCategory(id) {
    isDeleting.value = true
    try {
      await categoryService.delete(id)
      const category = categories.value.find((item) => item.id === id)

      categories.value = categories.value.filter((item) => item.id !== id)
      layout.setBadges({ categorias: categories.value.length })
      toast.success(`Categoría "${category?.name || ''}" eliminada con éxito.`)
    } catch (err) {
      toast.error(categoryErrorMessage(err, 'No se pudo eliminar la categoría.'))
      console.error(err)
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  function setSearch(query) {
    searchQuery.value = query
  }

  function resetSearch() {
    searchQuery.value = ''
  }

  return {
    categories,
    isLoading,
    isSaving,
    isDeleting,
    error,
    searchQuery,

    filteredCategories,
    stats,

    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setSearch,
    resetSearch,
  }
})

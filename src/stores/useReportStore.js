import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { errorMessage } from '../services/saleService'
import { PAYMENT_METHODS } from '../models/Sale'
import { useSaleStore } from './useSaleStore'
import { useBookStore } from './useBookStore'
import { useCategoryStore } from './useCategoryStore'

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

export const useReportStore = defineStore('reports', () => {
  const saleStore = useSaleStore()
  const bookStore = useBookStore()
  const categoryStore = useCategoryStore()

  const books = computed(() => bookStore.books)
  const loading = ref(false)
  const error = ref('')
  const filters = reactive({ categoryId: '', from: '', to: '', payment: '' })

  const selectedCategory = computed(() =>
    filters.categoryId === '' ? null : Number(filters.categoryId),
  )

  function inRange(iso) {
    const t = new Date(iso).getTime()
    if (filters.from && t < new Date(`${filters.from}T00:00:00`).getTime()) return false
    if (filters.to && t > new Date(`${filters.to}T23:59:59.999`).getTime()) return false
    return true
  }

  const filteredSales = computed(() =>
    saleStore.sales
      .filter((s) => inRange(s.date) && (!filters.payment || s.payment_method === filters.payment))
      .map((s) => {
        if (selectedCategory.value === null) return s
        const items = s.items.filter((i) => Number(i.category_id) === selectedCategory.value)
        return { ...s, items, total: items.reduce((sum, i) => sum + i.subtotal, 0) }
      })
      .filter((s) => s.items.length),
  )

  const scopedBooks = computed(() =>
    selectedCategory.value === null
      ? books.value
      : books.value.filter((b) => Number(b.categoryId) === selectedCategory.value),
  )

  const lowStockBooks = computed(() =>
    scopedBooks.value.filter((b) => b.stock <= b.minStock).sort((a, b) => a.stock - b.stock),
  )

  const criticalStockTotal = computed(
    () => books.value.filter((b) => b.stock <= b.minStock).length,
  )

  const availableCategories = computed(() => {
    if (categoryStore.categories.length) {
      return categoryStore.categories.map((c) => ({ id: c.id, name: c.name }))
    }
    const seen = new Map()
    for (const b of books.value) {
      if (b.categoryId != null && !seen.has(b.categoryId)) {
        seen.set(b.categoryId, { id: b.categoryId, name: b.categoryName || b.category })
      }
    }
    return [...seen.values()]
  })

  const kpis = computed(() => ({
    revenue: filteredSales.value.reduce((sum, s) => sum + s.total, 0),
    salesCount: filteredSales.value.length,
    booksSold: filteredSales.value.reduce(
      (sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0),
      0,
    ),
    inventoryValue: scopedBooks.value.reduce((sum, b) => sum + b.price * b.stock, 0),
    lowStockCount: lowStockBooks.value.length,
  }))

  const paymentBreakdown = computed(() =>
    PAYMENT_METHODS.map((method) => {
      const sales = filteredSales.value.filter((s) => s.payment_method === method)
      return {
        method,
        count: sales.length,
        amount: sales.reduce((sum, s) => sum + s.total, 0),
      }
    }),
  )

  const inventoryByCategory = computed(() => {
    const groups = new Map()
    for (const b of scopedBooks.value) {
      const catName = b.categoryName || b.category || 'Sin categoría'
      const g = groups.get(catName) ?? { category: catName, titles: 0, units: 0, value: 0 }
      g.titles++
      g.units += b.stock
      g.value += b.price * b.stock
      groups.set(catName, g)
    }
    return [...groups.values()].sort((a, b) => b.value - a.value)
  })

  const salesCsv = computed(() => {
    const header = [
      'Recibo', 'Fecha', 'Cliente', 'CI/NIT', 'Método de pago',
      'Libro', 'ISBN', 'Categoría', 'Cantidad', 'Precio unitario', 'Subtotal',
    ]
    const rows = filteredSales.value.flatMap((s) =>
      s.items.map((i) =>
        [
          s.receipt_no, s.date, s.customer_name, s.customer_nit, s.payment_method,
          i.title, i.isbn, i.category, i.quantity, i.unit_price, i.subtotal,
        ]
          .map(csvCell)
          .join(','),
      ),
    )
    return [header.map(csvCell).join(','), ...rows].join('\n')
  })

  async function loadCatalog() {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        bookStore.books.length ? Promise.resolve() : bookStore.fetchBooks(),
        categoryStore.categories.length ? Promise.resolve() : categoryStore.fetchCategories(),
      ])
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo cargar el inventario.')
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    Object.assign(filters, { categoryId: '', from: '', to: '', payment: '' })
  }

  return {
    books,
    loading,
    error,
    filters,
    filteredSales,
    lowStockBooks,
    criticalStockTotal,
    availableCategories,
    kpis,
    paymentBreakdown,
    inventoryByCategory,
    salesCsv,
    loadCatalog,
    resetFilters,
  }
})

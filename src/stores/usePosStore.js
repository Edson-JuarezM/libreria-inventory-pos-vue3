import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { discountStock, errorMessage, fetchCatalog } from '../services/saleService'
import {
  PAYMENT_METHODS,
  createSale,
  digitsOnly,
  isValidCardNumber,
  isValidExpiry,
  receiptNumber,
} from '../models/Sale'
import { useSaleStore } from './useSaleStore'

const normalize = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const emptyCard = () => ({ holder: '', number: '', expiry: '', cvv: '' })

export const usePosStore = defineStore('pos', () => {
  const saleStore = useSaleStore()

  const books = ref([])
  const loading = ref(false)
  const processing = ref(false)
  const error = ref('')

  const search = ref('')
  const categoryId = ref('')

  const cart = ref([])
  const customer = ref({ name: '', nit: '' })
  const paymentMethod = ref('Efectivo')
  const card = ref(emptyCard())
  const lastSale = ref(null)

  watch(paymentMethod, (method) => {
    if (method !== 'Tarjeta') card.value = emptyCard()
  })

  const bookById = computed(() => new Map(books.value.map((b) => [b.id, b])))

  const nextReceiptNo = computed(() => receiptNumber(saleStore.nextSequence))

  const availableCategories = computed(() => {
    const seen = new Map()
    for (const b of books.value) {
      if (b.categoryId != null && !seen.has(b.categoryId)) {
        seen.set(b.categoryId, { id: b.categoryId, name: b.category })
      }
    }
    return [...seen.values()]
  })

  const filteredBooks = computed(() => {
    const q = normalize(search.value.trim())
    const cat = categoryId.value === '' ? null : Number(categoryId.value)
    return books.value.filter(
      (b) =>
        (cat === null || b.categoryId === cat) &&
        (!q || [b.title, b.author, b.isbn, b.category].some((field) => normalize(field).includes(q))),
    )
  })

  const cartLines = computed(() =>
    cart.value
      .map((line) => {
        const book = bookById.value.get(line.bookId)
        return book ? { book, quantity: line.quantity, subtotal: book.price * line.quantity } : null
      })
      .filter(Boolean),
  )

  const total = computed(() => cartLines.value.reduce((sum, l) => sum + l.subtotal, 0))
  const itemCount = computed(() => cartLines.value.reduce((sum, l) => sum + l.quantity, 0))

  const quantityInCart = (bookId) => cart.value.find((l) => l.bookId === bookId)?.quantity ?? 0

  async function loadCatalog() {
    loading.value = true
    error.value = ''
    try {
      books.value = await fetchCatalog()
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo cargar el catálogo.')
    } finally {
      loading.value = false
    }
  }

  function addToCart(book) {
    if (book.stock <= 0) return { ok: false, message: `"${book.title}" está agotado.` }
    const current = quantityInCart(book.id)
    if (current + 1 > book.stock) {
      return { ok: false, message: `Solo hay ${book.stock} unidades de "${book.title}".` }
    }
    const line = cart.value.find((l) => l.bookId === book.id)
    if (line) line.quantity++
    else cart.value.push({ bookId: book.id, quantity: 1 })
    return { ok: true }
  }

  function setQuantity(bookId, quantity) {
    const book = bookById.value.get(bookId)
    if (!book) return { ok: false }
    if (quantity <= 0) {
      removeFromCart(bookId)
      return { ok: true }
    }
    if (quantity > book.stock) {
      return { ok: false, message: `Solo hay ${book.stock} unidades de "${book.title}".` }
    }
    const line = cart.value.find((l) => l.bookId === bookId)
    if (line) line.quantity = quantity
    return { ok: true }
  }

  function removeFromCart(bookId) {
    cart.value = cart.value.filter((l) => l.bookId !== bookId)
  }

  function clearCart() {
    cart.value = []
  }

  function validate() {
    const errors = {}
    if (!cart.value.length) errors.cart = 'Agrega al menos un libro al carrito.'
    if (customer.value.name.trim().length < 3) {
      errors.name = 'Ingresa el nombre o razón social (mínimo 3 letras).'
    }
    if (!/^[0-9A-Za-z-]{5,15}$/.test(customer.value.nit.trim())) {
      errors.nit = 'Ingresa un CI/NIT válido (5 a 15 caracteres, sin espacios).'
    }
    if (!PAYMENT_METHODS.includes(paymentMethod.value)) {
      errors.payment = 'Selecciona un método de pago.'
    }
    if (paymentMethod.value === 'Tarjeta') {
      const c = card.value
      if (c.holder.trim().length < 3) {
        errors.cardHolder = 'Ingresa el nombre del titular como figura en la tarjeta.'
      }
      if (!isValidCardNumber(c.number)) errors.cardNumber = 'El número de tarjeta no es válido.'
      if (!isValidExpiry(c.expiry)) errors.cardExpiry = 'Usa el formato MM/AA con una fecha vigente.'
      if (!/^\d{3,4}$/.test(c.cvv)) errors.cardCvv = 'El CVV tiene 3 o 4 dígitos.'
    }
    return errors
  }

  async function checkout() {
    if (Object.keys(validate()).length) throw new Error('Los datos de la venta están incompletos.')
    processing.value = true
    try {
      const lines = cartLines.value.map(({ book, quantity }) => ({ book, quantity }))
      const updatedBooks = await discountStock(lines)

      updatedBooks.forEach((updated) => {
        const i = books.value.findIndex((b) => b.id === updated.id)
        if (i >= 0) books.value[i] = updated
      })

      const sale = createSale({
        sequence: saleStore.nextSequence,
        customerName: customer.value.name,
        customerNit: customer.value.nit,
        paymentMethod: paymentMethod.value,
        cardLast4: paymentMethod.value === 'Tarjeta' ? digitsOnly(card.value.number).slice(-4) : '',
        lines,
      })
      saleStore.addSale(sale)

      lastSale.value = sale
      clearCart()
      customer.value = { name: '', nit: '' }
      paymentMethod.value = 'Efectivo'
      card.value = emptyCard()
      return sale
    } finally {
      processing.value = false
    }
  }

  return {
    books,
    loading,
    processing,
    error,
    search,
    categoryId,
    cart,
    customer,
    paymentMethod,
    card,
    lastSale,
    nextReceiptNo,
    filteredBooks,
    availableCategories,
    cartLines,
    total,
    itemCount,
    quantityInCart,
    loadCatalog,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    validate,
    checkout,
  }
})

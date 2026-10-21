export const PAYMENT_METHODS = ['Efectivo', 'QR', 'Tarjeta']

const round2 = (n) => Math.round(n * 100) / 100

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' })
const dateTime = new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' })

export const formatBs = (n) => money.format(n ?? 0)
export const formatDateTime = (iso) => dateTime.format(new Date(iso))
export const receiptNumber = (sequence) => `R-${String(sequence).padStart(6, '0')}`

export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')

export function formatCardNumber(value) {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function isValidCardNumber(value) {
  const digits = digitsOnly(value)
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (double) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    double = !double
  }
  return sum % 10 === 0
}

export function isValidExpiry(value) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  const now = new Date()
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

export function createSale({ sequence, customerName, customerNit, paymentMethod, cardLast4, lines }) {
  const items = lines.map(({ book, quantity }) => ({
    book_id: book.id,
    title: book.title,
    isbn: book.isbn,
    category_id: book.categoryId,
    category: book.category,
    unit_price: book.price,
    quantity,
    subtotal: round2(book.price * quantity),
  }))

  return {
    sequence,
    receipt_no: receiptNumber(sequence),
    customer_name: customerName.trim(),
    customer_nit: customerNit.trim(),
    payment_method: paymentMethod,
    ...(cardLast4 ? { card_last4: cardLast4 } : {}),
    items,
    total: round2(items.reduce((sum, i) => sum + i.subtotal, 0)),
    date: new Date().toISOString(),
  }
}

const DEFAULT_META = { isbn: '', author: '', stock: 0, minStock: 3, synopsis: '' }

const LEGACY_STOCK = 10

export const STOCK_STATUS = {
  AVAILABLE: 'En stock',
  LOW: 'Stock crítico',
  OUT: 'Agotado',
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function decodeMeta(description) {
  const meta = parseJson(description)
  if (meta && typeof meta === 'object' && 'stock' in meta) {
    return {
      ...DEFAULT_META,
      ...meta,
      stock: Number(meta.stock) || 0,
      minStock: Number(meta.minStock ?? DEFAULT_META.minStock) || 0,
    }
  }
  return { ...DEFAULT_META, stock: LEGACY_STOCK, synopsis: description ?? '' }
}

export function encodeMeta({ isbn, author, stock, minStock, synopsis }) {
  return JSON.stringify({
    isbn: isbn ?? '',
    author: author ?? '',
    stock,
    minStock,
    synopsis: synopsis ?? '',
  })
}

function cleanImage(images) {
  const raw = Array.isArray(images) ? images[0] : images
  if (typeof raw !== 'string') return null
  let url = raw.trim()
  if (url.startsWith('[')) {
    try {
      url = JSON.parse(url)[0]
    } catch {
      return null
    }
  }
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : null
}

export function toBook(product) {
  const meta = decodeMeta(product.description)
  return {
    id: product.id,
    title: product.title,
    price: Number(product.price) || 0,
    isbn: meta.isbn,
    author: meta.author,
    stock: meta.stock,
    minStock: meta.minStock,
    synopsis: meta.synopsis,
    categoryId: product.category?.id ?? null,
    category: product.category?.name ?? 'Sin categoría',
    image: cleanImage(product.images),
  }
}

export function toPayload(book) {
  return {
    title: book.title,
    price: book.price,
    categoryId: book.categoryId,
    images: [book.image],
    description: encodeMeta(book),
  }
}

export function toStockPayload(book, newStock) {
  return { description: encodeMeta({ ...book, stock: newStock }) }
}

export function getStockStatus(book) {
  if (book.stock <= 0) return STOCK_STATUS.OUT
  if (book.stock <= book.minStock) return STOCK_STATUS.LOW
  return STOCK_STATUS.AVAILABLE
}

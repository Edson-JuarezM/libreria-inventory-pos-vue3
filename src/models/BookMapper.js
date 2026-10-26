const DEFAULT_META = { isbn: '', author: '', stock: 0, minStock: 3, synopsis: '' }

const LEGACY_STOCK = 10

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'

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

//Catálogo literario.
export const SAMPLE_BOOKS = [
  {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '978-84-397-2163-2',
    categoryName: 'Novela y Ficción',
    categoryId: 1,
    price: 89,
    stock: 12,
    minStock: 4,
    synopsis:
      'Obra cumbre del realismo mágico sobre la saga de la familia Buendía en el pueblo mítico de Macondo.',
    image:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'El principito',
    author: 'Antoine de Saint-Exupéry',
    isbn: '978-84-206-7151-1',
    categoryName: 'Infantil y Juvenil',
    categoryId: 4,
    price: 45,
    stock: 2,
    minStock: 5,
    synopsis:
      'Relato poético que reflexiona sobre la amistad, el amor y el sentido de la vida.',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    isbn: '978-84-376-0494-7',
    categoryName: 'Historia y Ensayo',
    categoryId: 3,
    price: 110,
    stock: 7,
    minStock: 3,
    synopsis:
      'Clásico de la literatura española que narra las andanzas del ingenioso hidalgo Don Quijote.',
    image:
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Rayuela',
    author: 'Julio Cortázar',
    isbn: '978-84-204-7189-0',
    categoryName: 'Novela y Ficción',
    categoryId: 1,
    price: 75,
    stock: 0,
    minStock: 4,
    synopsis:
      'Novela revolucionaria de lectura lúdica y no lineal protagonizada por Horacio Oliveira y la Maga.',
    image:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Ficciones',
    author: 'Jorge Luis Borges',
    isbn: '978-84-206-3312-0',
    categoryName: 'Novela y Ficción',
    categoryId: 1,
    price: 65,
    stock: 14,
    minStock: 4,
    synopsis:
      'Antología de cuentos laberínticos, espejos, paradojas y bibliotecas infinitas.',
    image:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'La casa de los espíritus',
    author: 'Isabel Allende',
    isbn: '978-84-01-34345-2',
    categoryName: 'Novela y Ficción',
    categoryId: 1,
    price: 82,
    stock: 9,
    minStock: 3,
    synopsis:
      'Historia de cuatro generaciones de la familia Trueba y las transformaciones sociopolíticas de un país.',
    image:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Breve historia del tiempo',
    author: 'Stephen Hawking',
    isbn: '978-84-8432-619-9',
    categoryName: 'Ciencia y Tecnología',
    categoryId: 2,
    price: 95,
    stock: 6,
    minStock: 2,
    synopsis:
      'Explicación divulgativa sobre el origen del universo, los agujeros negros y la física moderna.',
    image:
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Veinte poemas de amor y una canción desesperada',
    author: 'Pablo Neruda',
    isbn: '978-84-376-0158-8',
    categoryName: 'Arte y Poesía',
    categoryId: 5,
    price: 40,
    stock: 8,
    minStock: 3,
    synopsis:
      'Uno de los poemarios de amor más leídos de la lírica hispanoamericana.',
    image:
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
  },
]

//Diccionario de categorías literarias
export const CATEGORY_NAMES = {
  1: 'Novela y Ficción',
  2: 'Ciencia y Tecnología',
  3: 'Historia y Ensayo',
  4: 'Infantil y Juvenil',
  5: 'Arte y Poesía',
  clothes: 'Novela y Ficción',
  electronics: 'Ciencia y Tecnología',
  furniture: 'Historia y Ensayo',
  shoes: 'Infantil y Juvenil',
  miscellaneous: 'Arte y Poesía',
}

export function translateCategory(catIdOrName) {
  if (!catIdOrName) return 'Sin categoría'
  const key = String(catIdOrName).toLowerCase().trim()
  return CATEGORY_NAMES[catIdOrName] || CATEGORY_NAMES[key] || String(catIdOrName).trim()
}

//URLs de imágenes de Platzi API
export function sanitizeImageUrl(images) {
  if (!images) return DEFAULT_COVER_IMAGE

  let first = Array.isArray(images) ? images[0] : images
  if (typeof first !== 'string') return DEFAULT_COVER_IMAGE

  first = first.replace(/^[["']+|[\]"']+$/g, '').trim()

  if (!first || !first.startsWith('http')) {
    return DEFAULT_COVER_IMAGE
  }
  return first
}

//Determina el estado del stock
export function calculateStockStatus(stock, minStock) {
  const current = Number(stock) || 0
  const min = Number(minStock) || 0

  if (current <= 0) {
    return {
      code: 'OUT_OF_STOCK',
      label: 'Agotado',
      badgeClass: 'badge-ghost',
      textClass: 'text-slate-400 font-medium',
    }
  }

  if (current <= min) {
    return {
      code: 'LOW_STOCK',
      label: 'Stock Crítico',
      badgeClass: 'badge-error',
      textClass: 'text-error font-semibold',
    }
  }

  return {
    code: 'IN_STOCK',
    label: 'Disponible',
    badgeClass: 'badge-success',
    textClass: 'text-success font-medium',
  }
}

export const BookMapper = {

  //Transforma un producto recibido de la API a una entidad Libro
  toDomain(apiProduct, index = 0) {
    if (!apiProduct) return null

    let meta = null
    let hasCustomBookJson = false

    try {
      if (
        typeof apiProduct.description === 'string' &&
        apiProduct.description.trim().startsWith('{')
      ) {
        meta = JSON.parse(apiProduct.description)
        if (meta && (meta.isbn || meta.author)) {
          hasCustomBookJson = true
        }
      }
    } catch {
      meta = null
    }

    const id = apiProduct.id

    // Si el producto fue creado o editado por la aplicación, respeta sus datos
    if (hasCustomBookJson) {
      const title = apiProduct.title || 'Libro sin título'
      const price = Number(apiProduct.price) || 0
      const isbn = meta.isbn || `978-999${String(Math.abs(Number(id) || 1)).padStart(4, '0')}-1`
      const author = meta.author || 'Autor no especificado'
      const stock = meta.stock !== undefined ? Math.max(0, Number(meta.stock)) : 10
      const minStock = meta.minStock !== undefined ? Math.max(0, Number(meta.minStock)) : 4
      const synopsis = meta.synopsis || ''

      const rawCatId = apiProduct.category?.id || apiProduct.categoryId || 1
      const categoryId = Number(rawCatId) || 1
      const categoryName = translateCategory(apiProduct.category?.name || categoryId)
      const image = sanitizeImageUrl(apiProduct.images)
      const stockStatus = calculateStockStatus(stock, minStock)

      return {
        id,
        title,
        price,
        isbn,
        author,
        stock,
        minStock,
        synopsis,
        categoryId,
        categoryName,
        category: { id: categoryId, name: categoryName },
        image,
        images: [image],
        stockStatus,
      }
    }

    // Si es un producto de la API pública es en inglés
    const sample = SAMPLE_BOOKS[index % SAMPLE_BOOKS.length]
    const title = sample.title
    const author = sample.author
    const isbn = sample.isbn
    const price = Number(apiProduct.price) > 0 ? Number(apiProduct.price) : sample.price
    const stock = sample.stock
    const minStock = sample.minStock
    const synopsis = sample.synopsis
    const categoryId = sample.categoryId
    const categoryName = sample.categoryName
    const image = sample.image
    const stockStatus = calculateStockStatus(stock, minStock)

    return {
      id,
      title,
      price,
      isbn,
      author,
      stock,
      minStock,
      synopsis,
      categoryId,
      categoryName,
      category: { id: categoryId, name: categoryName },
      image,
      images: [image],
      stockStatus,
    }
  },

  //Transforma una lista de productos de la API a lista de libros

  toDomainList(list, maxItems = 8) {
    if (!Array.isArray(list)) return []
    const limited = list.slice(0, maxItems)
    return limited.map((item, idx) => this.toDomain(item, idx)).filter(Boolean)
  },

  //Transforma los datos de un libro del formulario al payload exacto esperado por
  //Platzi API en POST /api/v1/products o PUT /api/v1/products/:id.

  toApi(book) {
    if (!book) return {}

    const description = JSON.stringify({
      isbn: (book.isbn || '').trim(),
      author: (book.author || '').trim(),
      stock: Math.max(0, Number(book.stock) || 0),
      minStock: Math.max(0, Number(book.minStock ?? 4)),
      synopsis: (book.synopsis || '').trim(),
    })

    const imageUrl =
      (book.image || '').trim() ||
      (Array.isArray(book.images) && book.images[0]) ||
      DEFAULT_COVER_IMAGE

    return {
      title: (book.title || '').trim(),
      price: Math.max(0, Number(book.price) || 0),
      description,
      categoryId: Number(book.categoryId) || 1,
      images: [imageUrl],
    }
  },
}

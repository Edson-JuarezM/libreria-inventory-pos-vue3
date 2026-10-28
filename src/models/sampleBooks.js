import { SAMPLE_BOOKS as BASE_BOOKS, calculateStockStatus } from './BookMapper'

export const SAMPLE_BOOKS = BASE_BOOKS.map((book, i) => {
  const id = i + 1
  const stockStatus = calculateStockStatus(book.stock, book.minStock)
  return {
    ...book,
    id,
    category: book.categoryName,
    categoryObj: { id: book.categoryId, name: book.categoryName },
    images: [book.image],
    stockStatus,
    local: true,
  }
})

import apiClient from './apiClient'
import { bookService } from './bookService'
import { BookMapper, readStockMap, writeStockMap, toStockPayload } from '../models/BookMapper'
import { SAMPLE_BOOKS } from '../models/sampleBooks'

export const CATALOG_LIMIT = 8

export function errorMessage(error, fallback = 'No se pudo completar la operación.') {
  const msg = error?.response?.data?.message
  return Array.isArray(msg) ? msg.join(', ') : msg || error?.message || fallback
}

function loadSampleBooks() {
  const map = readStockMap()
  return SAMPLE_BOOKS.map((book) => ({ ...book, stock: map[book.id] ?? book.stock }))
}

function saveSampleStock(book, stock) {
  writeStockMap({ ...readStockMap(), [book.id]: stock })
  return { ...book, stock }
}

export async function fetchCatalog() {
  try {
    const data = await bookService.getAll({ limit: 8, offset: 0 })
    if (Array.isArray(data) && data.length) {
      return BookMapper.toDomainList(data)
    }
  } catch (err) {
    console.warn('Fallo al conectar con la API en fetchCatalog, usando fallback:', err)
  }
  return loadSampleBooks()
}

async function readFresh(book) {
  const map = readStockMap()
  if (map[book.id] !== undefined) {
    return { ...book, stock: map[book.id] }
  }
  return book
}

async function writeStock(book, stock) {
  saveSampleStock(book, stock)
  try {
    if (!book.local) {
      await apiClient.put(`/products/${book.id}`, toStockPayload(book, stock))
    }
  } catch (err) {
    console.warn(`No se pudo sincronizar el stock del libro ${book.id} con la API:`, err)
  }
  return { ...book, stock }
}

export async function discountStock(lines) {
  const applied = []
  try {
    for (const { book, quantity } of lines) {
      const before = await readFresh(book)
      if (before.stock < quantity) {
        throw new Error(`Stock insuficiente de "${before.title}": quedan ${before.stock}.`)
      }
      const updated = await writeStock(before, before.stock - quantity)
      applied.push({ before, updated })
    }
    return applied.map((a) => a.updated)
  } catch (error) {
    await Promise.allSettled(applied.map((a) => writeStock(a.before, a.before.stock)))
    throw error
  }
}

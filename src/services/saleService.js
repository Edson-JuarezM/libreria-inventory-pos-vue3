import apiClient from './apiClient'
import { toBook, toStockPayload } from '../models/BookMapper'
import { SAMPLE_BOOKS } from '../models/sampleBooks'

const unwrap = (response) => response?.data ?? response

const PAGE_SIZE = 100
const MAX_PAGES = 10
const STOCK_KEY = 'libreria:sample-stock'

export const CATALOG_LIMIT = 6

export function errorMessage(error, fallback = 'No se pudo completar la operación.') {
  const msg = error?.response?.data?.message
  return Array.isArray(msg) ? msg.join(', ') : msg || error?.message || fallback
}

function readStockMap() {
  try {
    return JSON.parse(localStorage.getItem(STOCK_KEY)) ?? {}
  } catch {
    return {}
  }
}

function writeStockMap(map) {
  try {
    localStorage.setItem(STOCK_KEY, JSON.stringify(map))
    return true
  } catch {
    return false
  }
}

function loadSampleBooks() {
  const map = readStockMap()
  return SAMPLE_BOOKS.map((book) => ({ ...book, stock: map[book.id] ?? book.stock }))
}

function saveSampleStock(book, stock) {
  writeStockMap({ ...readStockMap(), [book.id]: stock })
  return { ...book, stock }
}

async function fetchApiBooks() {
  const books = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const chunk = unwrap(
      await apiClient.get('/products', { params: { offset: page * PAGE_SIZE, limit: PAGE_SIZE } }),
    )
    books.push(...chunk.map(toBook).filter((book) => book.isbn))
    if (chunk.length < PAGE_SIZE) break
  }
  return books
}

export async function fetchCatalog() {
  try {
    const books = await fetchApiBooks()
    if (books.length) return books.slice(0, CATALOG_LIMIT)
  } catch {
    return loadSampleBooks()
  }
  return loadSampleBooks()
}

async function readFresh(book) {
  if (book.local) return loadSampleBooks().find((b) => b.id === book.id)
  return toBook(unwrap(await apiClient.get(`/products/${book.id}`)))
}

async function writeStock(book, stock) {
  if (book.local) return saveSampleStock(book, stock)
  return toBook(unwrap(await apiClient.put(`/products/${book.id}`, toStockPayload(book, stock))))
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

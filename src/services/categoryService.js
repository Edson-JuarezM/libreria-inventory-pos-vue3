import apiClient from './apiClient'
import { toCategory, toCategoryPayload } from '@/models/Category'
import { translateCategory } from '@/models/BookMapper'

function withLiteraryName(category) {
  if (!category) return null

  return {
    ...category,
    name: translateCategory(category.name || category.id),
  }
}

export const categoryService = {
  //Obtiene la lista completa de categorías
  async getAll() {
    const response = await apiClient.get('/categories')
    const data = Array.isArray(response.data) ? response.data : []

    return data.map(toCategory).filter(Boolean).map(withLiteraryName)
  },

  //Obtiene una categoría por su ID
  async getById(id) {
    const response = await apiClient.get(`/categories/${id}`)
    return withLiteraryName(toCategory(response.data))
  },

  //Crea una categoría
  async create(category) {
    const response = await apiClient.post('/categories', toCategoryPayload(category))
    return withLiteraryName(toCategory(response.data))
  },

  //Actualiza una categoría existente
  async update(id, category) {
    const response = await apiClient.put(`/categories/${id}`, toCategoryPayload(category))
    return withLiteraryName(toCategory(response.data))
  },

  //Elimina una categoría
  async delete(id) {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data
  },

  //Obtiene los productos asociados a una categoría
  async getProducts(id) {
    const response = await apiClient.get(`/categories/${id}/products`)
    return Array.isArray(response.data) ? response.data : []
  },
}

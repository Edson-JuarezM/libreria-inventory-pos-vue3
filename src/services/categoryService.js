import apiClient from './apiClient'
import { translateCategory } from '@/models/BookMapper'

export const categoryService = {

  //Obtiene la lista de categorías
  async getAll() {
    const response = await apiClient.get('/categories')
    const data = response.data || []

    return data.slice(0, 5).map((cat) => ({
      ...cat,
      name: translateCategory(cat.name || cat.id),
    }))
  },

  //Obtiene una categoría por su ID
  async getById(id) {
    const response = await apiClient.get(`/categories/${id}`)
    const cat = response.data
    return {
      ...cat,
      name: translateCategory(cat.name || cat.id),
    }
  },
}

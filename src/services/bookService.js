import apiClient from './apiClient'

const ENDPOINT = '/products'

export const bookService = {
  //Obtiene la lista de libros (datos crudos de la API; el store los mapea con BookMapper)
  async getAll(params = { limit: 8, offset: 0 }) {
    const response = await apiClient.get(ENDPOINT, { params })
    return response.data
  },

  //Obtiene el detalle de un libro específico por ID
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINT}/${id}`)
    return response.data
  },

  //Crea un nuevo libro
  async create(payload) {
    const response = await apiClient.post(ENDPOINT, payload)
    return response.data
  },

  //Actualiza un libro existente
  async update(id, payload) {
    const response = await apiClient.put(`${ENDPOINT}/${id}`, payload)
    return response.data
  },

  //Elimina un libro
  async delete(id) {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`)
    return response.data
  },

  //Consulta libros filtrados por ID de categoría
  async getByCategory(categoryId) {
    const response = await apiClient.get(`/categories/${categoryId}/products`)
    return response.data
  },
}

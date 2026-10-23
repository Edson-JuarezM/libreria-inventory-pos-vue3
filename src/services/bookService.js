import apiClient from './apiClient'

export const bookService = {

  //Obtiene la lista de libros
  async getAll(params = { limit: 8, offset: 0 }) {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  //Obtiene el detalle de un libro específico por ID
  async getById(id) {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },


  // Crea un nuevo libro
  async create(payload) {
    const response = await apiClient.post('/products', payload)
    return response.data
  },

  //Actualiza un libro existente
  async update(id, payload) {
    const response = await apiClient.put(`/products/${id}`, payload)
    return response.data
  },

  //Elimina un libro mediante
  async delete(id) {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },

  //Consulta libros filtrados por ID de categoría
  async getByCategory(categoryId) {
    const response = await apiClient.get(`/categories/${categoryId}/products`)
    return response.data
  },
}

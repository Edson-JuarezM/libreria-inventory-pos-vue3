import { BookMapper } from '@/models/bookMapper'
import apiClient from '@/services/apiClient'

const ENDPOINT = '/products'

export const bookService = {
  /**
   * RF-07: Obtener el listado completo de libros y artículos (Lectura)
   * @returns {Promise<Array>} Lista de libros transformados para el frontend
   */
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINT);
      // Extraemos la data de la respuesta de la API (ajustar si la respuesta viene envuelta en data.data o similar)
      const rawData = response.data?.data || response.data || [];

      // Enviamos el listado al mapper para decodificarlo antes de enviarlo a la vista
      return BookMapper.toFrontendCollection(rawData);
    } catch (error) {
      console.error('Error en bookService.getAll:', error);
      throw error;
    }
  },

  /**
   * RF-07: Obtener los detalles de un único libro por su ID
   * @param {Number|String} id
   * @returns {Promise<Object>} Libro transformado para el frontend
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`)
      const rawData = response.data?.data || response.data;
      return BookMapper.toFrontend(rawData);
    } catch (error) {
      console.error(`Error en bookService.getById (${id}):`, error);
      throw error;
    }
  },

  /**
   * RF-07: Crear un nuevo libro o artículo en el catálogo (Escritura / Alta)
   * @param {Object} localBookData - Datos del formulario nativo de Vue
   * @returns {Promise<Object>} Libro creado devuelto por la API y mapeado
   */
  async create(localBookData) {
    try {
      // Codificamos el objeto nativo del frontend al formato que requiere la API (RF-09)
      const apiPayload = BookMapper.toApi(localBookData);

      const response = await apiClient.post(ENDPOINT, apiPayload);
      const rawData = response.data?.data || response.data;
      return BookMapper.toFrontend(rawData);
    } catch (error) {
      console.error('Error en bookService.create:', error);
      throw error;
    }
  },

  /**
   * RF-07: Actualizar la información de un libro existente (Modificación / Edición)
   * @param {Number|String} id - Identificador del libro
   * @param {Object} localBookData - Nuevos datos del formulario
   * @returns {Promise<Object>} Libro modificado devuelto por la API y mapeado
   */
  async update(id, localBookData) {
    try {
      // Aseguramos que viaje codificado correctamente bajo los estándares requeridos
      const apiPayload = BookMapper.toApi(localBookData);

      const response = await apiClient.put(`${ENDPOINT}/${id}`, apiPayload)
      const rawData = response.data?.data || response.data;
      return BookMapper.toFrontend(rawData);
    } catch (error) {
      console.error(`Error en bookService.update (${id}):`, error);
      throw error;
    }
  },

  /**
   * RF-07: Eliminar de manera lógica o física un libro del catálogo (Baja)
   * @param {Number|String} id - Identificador del libro a eliminar
   * @returns {Promise<Boolean>} Confirmación del éxito de la operación
   */
  async delete(id) {
    try {
      await apiClient.delete(`${ENDPOINT}/${id}`)
      return true;
    } catch (error) {
      console.error(`Error en bookService.delete (${id}):`, error);
      throw error;
    }
  }
};

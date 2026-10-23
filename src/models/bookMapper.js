/**
 * BookMapper - Patrón de Mapeo de Datos (RF-09)
 * Se encarga de codificar (enviar a la API) y decodificar (recibir de la API)
 * los atributos del libro, asegurando la consistencia de tipos de datos.
 */
export const BookMapper = {
  /**
   * DECODEN: Transforma el payload crudo de la API a un objeto nativo para Vue.
   * @param {Object} apiPayload - Datos provenientes del endpoint /api/v1/products
   * @returns {Object} Objeto formateado para la interfaz
   */
  toFrontend(apiPayload) {
    if (!apiPayload) return null;

    return {
      id: apiPayload.id || null,
      title: apiPayload.name || apiPayload.title || '', // Mapea el nombre comercial al título del libro

      // RF-09: Decodificación y limpieza de atributos esenciales
      isbn: apiPayload.isbn ? String(apiPayload.isbn).trim() : '',
      author: apiPayload.author || apiPayload.brand || 'Autor Desconocido', // Usa 'brand' o 'author' según devuelva el backend genérico

      // Gestión estricta de Stock e inventario numérico
      stock: apiPayload.stock !== undefined ? Number(apiPayload.stock) : 0,
      price: apiPayload.price !== undefined ? Number(apiPayload.price) : 0,

      // Vinculación opcional con la categoría del Integrante 2
      categoryId: apiPayload.category_id || apiPayload.categoryId || null,
      categoryName: apiPayload.category?.name || 'Sin Categoría',

      createdAt: apiPayload.created_at ? new Date(apiPayload.created_at) : null
    };
  },

  /**
   * CODIFICAR: Transforma el objeto de tu formulario Vue en el formato estructurado
   * que espera recibir la API en sus peticiones POST / PUT.
   * @param {Object} localBook - Datos del formulario en la vista
   * @returns {Object} Payload listo para enviar por HTTP
   */
  toApi(localBook) {
    if (!localBook) return null;

    return {
      // Si es una edición incluye el ID, si es creación no
      ...(localBook.id && { id: localBook.id }),

      name: localBook.title ? localBook.title.trim() : '',

      // RF-09: Codificación segura eliminando espacios innecesarios
      isbn: localBook.isbn ? String(localBook.isbn).replace(/[-\s]/g, '') : '', // Limpia guiones si los hay
      author: localBook.author ? localBook.author.trim() : 'Anónimo',

      // Sanitización numérica antes del envío
      stock: Math.max(0, parseInt(localBook.stock, 10) || 0),
      price: Math.max(0, parseFloat(localBook.price) || 0),

      category_id: localBook.categoryId || null
    };
  },

  /**
   * Convierte un listado (Array) completo de libros desde la API
   * @param {Array} apiList
   * @returns {Array} Listado mapeado para la tabla
   */
  toFrontendCollection(apiList) {
    if (!Array.isArray(apiList)) return [];
    return apiList.map(item => this.toFrontend(item));
  }
};

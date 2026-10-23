import { defineStore } from 'pinia';
import { bookService } from '../services/bookService';

export const useBookStore = defineStore('book', {
  // 1. STATE: El almacén central de datos de tu módulo
  state: () => ({
    books: [],        // Lista global de libros (ya decodificados por el Mapper)
    loading: false,   // Estado para mostrar spinners o loaders en la vista
    error: null,      // Captura de mensajes de error de la API

    // RF-08: Estado para almacenar los criterios de los filtros dinámicos
    filters: {
      searchQuery: '',   // Filtra por título o ISBN simultáneamente
      categoryId: null,  // Filtra por la categoría seleccionada (Enlace con Integrante 2)
      minPrice: null,    // Rango mínimo de precio
      maxPrice: null,    // Rango máximo de precio
      stockStatus: 'all' // Estados posibles: 'all', 'available', 'critical', 'out'
    }
  }),

  // 2. GETTERS: Lógica calculada reactiva para filtrar el catálogo en la interfaz (RF-08)
  getters: {
    /**
     * Devuelve el listado de libros aplicando todos los filtros dinámicos en tiempo real
     */
    filteredBooks(state) {
      return state.books.filter(book => {
        // A) Filtro por Título o ISBN (Coincidencia parcial ignorando mayúsculas)
        const query = state.filters.searchQuery.toLowerCase().trim();
        const matchesQuery = !query ||
          book.title.toLowerCase().includes(query) ||
          book.isbn.includes(query);

        // B) Filtro por Categoría
        const matchesCategory = !state.filters.categoryId ||
          book.categoryId === state.filters.categoryId;

        // C) Filtro por Rango de Precios
        const matchesMinPrice = state.filters.minPrice === null || state.filters.minPrice === '' ||
          book.price >= Number(state.filters.minPrice);
        const matchesMaxPrice = state.filters.maxPrice === null || state.filters.maxPrice === '' ||
          book.price <= Number(state.filters.maxPrice);

        // D) Filtro por Estado de Inventario (Disponible / Crítico / Agotado)
        let matchesStock = true;
        if (state.filters.stockStatus === 'available') {
          matchesStock = book.stock > 5; // Stock normal
        } else if (state.filters.stockStatus === 'critical') {
          matchesStock = book.stock > 0 && book.stock <= 5; // RF-08: Stock Crítico
        } else if (state.filters.stockStatus === 'out') {
          matchesStock = book.stock === 0; // RF-08: Agotado
        }

        // Combinación de todas las condiciones
        return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
      });
    },

    /**
     * Cuenta la cantidad de libros que se encuentran actualmente en stock crítico
     */
    criticalStockCount(state) {
      return state.books.filter(b => b.stock > 0 && b.stock <= 5).length;
    }
  },

  // 3. ACTIONS: Métodos que llaman al servicio y modifican el estado
  actions: {
    /**
     * Obtiene todos los libros desde la API usando el servicio y actualiza el estado local
     */
    async fetchBooks() {
      this.loading = true;
      this.error = null;
      try {
        // Consume el servicio (RF-07) que ya devuelve la data mapeada (RF-09)
        this.books = await bookService.getAll();
      } catch (err) {
        this.error = err.message || 'Error al cargar el catálogo de libros';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Resetea todos los filtros de búsqueda a sus valores iniciales
     */
    resetFilters() {
      this.filters = {
        searchQuery: '',
        categoryId: null,
        minPrice: null,
        maxPrice: null,
        stockStatus: 'all'
      };
    }
  }
});

<script setup>
import { onMounted, ref } from 'vue'
import { useBookStore } from '@/stores/useBookStore'
import { bookService } from '@/services/bookService'
import { useToast } from '@/composables/useToast'

// Instanciamos el store de Pinia y el sistema de notificaciones
const bookStore = useBookStore()
const toast = useToast()

// Estados locales para el control del Modal de Formulario (Alta / Edición)
const isModalOpen = ref(false)
const isEditing = ref(false)

// Objeto reactivo que vincula los campos del formulario
const bookForm = ref({
  id: null,
  title: '',
  author: '',
  isbn: '',
  price: 0,
  stock: 0,
  categoryId: null,
})

// Cargar los libros automáticamente cuando la pantalla se renderice
onMounted(() => {
  bookStore.fetchBooks()
})

// --- FUNCIONES DE CONTROL ---

// Abre el modal configurado para un nuevo registro (Alta)
const openCreateModal = () => {
  isEditing.value = false
  bookForm.value = {
    id: null,
    title: '',
    author: '',
    isbn: '',
    price: 0,
    stock: 0,
    categoryId: null,
  }
  isModalOpen.value = true
}

// Abre el modal cargando la información de un libro existente (Modificación)
const openEditModal = (book) => {
  isEditing.value = true
  // Copiamos las propiedades para evitar modificar la tabla directamente antes de guardar
  bookForm.value = { ...book }
  isModalOpen.value = true
}

// Cierra el modal de forma segura
const closeModal = () => {
  isModalOpen.value = false
}

// Procesa el guardado del formulario (Crea o Edita usando el servicio)
const handleSaveBook = async () => {
  try {
    if (isEditing.value) {
      await bookService.update(bookForm.value.id, bookForm.value)
    } else {
      await bookService.create(bookForm.value)
    }
    closeModal()
    await bookStore.fetchBooks() // Refresca la tabla automáticamente
    toast.success(isEditing.value ? 'Libro actualizado con éxito' : 'Libro creado con éxito')
  } catch {
    toast.error('Ocurrió un error al procesar la solicitud.')
  }
}

// Elimina un registro del catálogo tras confirmación (Baja)
const handleDeleteBook = async (id) => {
  if (confirm('¿Está seguro de que desea eliminar este artículo del catálogo?')) {
    try {
      await bookService.delete(id)
      await bookStore.fetchBooks() // Refresca la tabla
      toast.success('Artículo eliminado del catálogo')
    } catch {
      toast.error('Error al intentar eliminar el artículo.')
    }
  }
}
</script>

<template>
  <div class="container-catalogo">
    <!-- Encabezado Principal -->
    <header class="header-seccion">
      <div>
        <h1>📚 Catálogo de Libros y Artículos</h1>
        <p>Módulo de administración de inventario general.</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        ➕ Agregar Nuevo Artículo
      </button>
    </header>

    <!-- Alerta de Stock Crítico Global -->
    <div v-if="bookStore.criticalStockCount > 0" class="alerta-critica">
      ⚠️ ¡Atención! Hay <strong>{{ bookStore.criticalStockCount }}</strong> artículos en estado de Stock Crítico.
    </div>

    <!-- SECCIÓN DE FILTROS DINÁMICOS (RF-08) -->
    <section class="barra-filtros">
      <div class="grupo-filtro">
        <label>Búsqueda rápida</label>
        <input 
          v-model="bookStore.filters.searchQuery" 
          type="text" 
          placeholder="Buscar por título o ISBN..." 
        />
      </div>

      <div class="grupo-filtro">
        <label>Estado del Inventario</label>
        <select v-model="bookStore.filters.stockStatus">
          <option value="all">Todos los estados</option>
          <option value="available">Disponible (> 5 unidades)</option>
          <option value="critical">🚨 Stock Crítico (1 a 5 unidades)</option>
          <option value="out">❌ Agotado (0 unidades)</option>
        </select>
      </div>

      <div class="grupo-filtro-rango">
        <label>Rango de Precio</label>
        <div class="inputs-rango">
          <input v-model="bookStore.filters.minPrice" type="number" placeholder="Mín" />
          <input v-model="bookStore.filters.maxPrice" type="number" placeholder="Máx" />
        </div>
      </div>

      <button @click="bookStore.resetFilters" class="btn-secondary">
        Limpiar Filtros
      </button>
    </section>

    <!-- LISTADO / TABLA DE DATOS (RF-07) -->
    <main class="tabla-contenedor">
      <div v-if="bookStore.loading" class="estado-mensaje">Cargando catálogo...</div>
      <div v-else-if="bookStore.error" class="estado-mensaje error-mensaje">
        {{ bookStore.error }}
      </div>
      <div v-else-if="bookStore.filteredBooks.length === 0" class="estado-mensaje">
        No se encontraron libros o artículos que coincidan con los filtros.
      </div>
      
      <table v-else class="tabla-datos">
        <thead>
          <tr>
            <th>Título / Artículo</th>
            <th>Autor / Marca</th>
            <th>ISBN / Código</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in bookStore.filteredBooks" :key="book.id">
            <td class="texto-principal">{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td class="codigo-isbn">{{ book.isbn }}</td>
            <td>${{ book.price.toFixed(2) }}</td>
            <td>{{ book.stock }} u.</td>
            <!-- Alertas Visuales de Stock (RF-08) -->
            <td>
              <span v-if="book.stock === 0" class="badge badge-danger">Agotado</span>
              <span v-else-if="book.stock <= 5" class="badge badge-warning">Stock Crítico</span>
              <span v-else class="badge badge-success">Disponible</span>
            </td>
            <!-- Acciones CRUD -->
            <td class="celda-acciones">
              <button @click="openEditModal(book)" class="btn-icon-edit" title="Editar">✏️</button>
              <button @click="handleDeleteBook(book.id)" class="btn-icon-delete" title="Eliminar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>

    <!-- MODAL INTERACTIVO DE ALTA / EDICIÓN (RF-07) -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditing ? '📝 Editar Artículo' : '➕ Registrar Nuevo Artículo' }}</h2>
        
        <form @submit.prevent="handleSaveBook" class="formulario-modal">
          <div class="campo">
            <label>Título del Libro o Artículo *</label>
            <input v-model="bookForm.title" type="text" required placeholder="Ej: Cien años de soledad" />
          </div>

          <div class="campo">
            <label>Autor o Marca *</label>
            <input v-model="bookForm.author" type="text" required placeholder="Ej: Gabriel García Márquez" />
          </div>

          <div class="campo">
            <label>Código ISBN / Identificador *</label>
            <input v-model="bookForm.isbn" type="text" required placeholder="Ej: 9780307474728" />
          </div>

          <div class="filas-identicas">
            <div class="campo">
              <label>Precio ($) *</label>
              <input v-model.number="bookForm.price" type="number" step="0.01" min="0" required />
            </div>

            <div class="campo">
              <label>Cantidad en Stock *</label>
              <input v-model.number="bookForm.stock" type="number" min="0" required />
            </div>
          </div>

          <div class="modal-acciones">
            <button type="button" @click="closeModal" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-guardar">
              {{ isEditing ? 'Guardar Cambios' : 'Registrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos estructurales básicos para que tu interfaz se vea limpia y moderna */
.container-catalogo { padding: 20px; font-family: sans-serif; }
.header-seccion { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.alerta-critica { background-color: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #fca5a5; }
.barra-filtros { display: flex; gap: 15px; background: #f3f4f6; padding: 15px; border-radius: 8px; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; }
.grupo-filtro { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 150px; }
.grupo-filtro-rango { display: flex; flex-direction: column; gap: 5px; }
.inputs-rango { display: flex; gap: 5px; width: 150px; }
input, select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
.btn-primary { background: #2563eb; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-secondary { height: 38px; padding: 0 15px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; }
.tabla-contenedor { background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.tabla-datos { width: 100%; border-collapse: collapse; text-align: left; }
.tabla-datos th, .tabla-datos td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
.tabla-datos th { background: #f9fafb; color: #374151; }
.texto-principal { font-weight: bold; color: #111827; }
.codigo-isbn { font-family: monospace; color: #4b5563; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.85em; font-weight: bold; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef9c3; color: #854d0e; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.celda-acciones { display: flex; gap: 10px; }
.btn-icon-edit, .btn-icon-delete { background: none; border: none; cursor: pointer; font-size: 1.2em; }
.estado-mensaje { padding: 30px; text-align: center; color: #6b7280; }
.error-mensaje { color: #991b1b; }
/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 25px; border-radius: 8px; width: 100%; max-width: 500px; }
.modal-content h2 { margin-top: 0; margin-bottom: 20px; color: #111827; }
.formulario-modal { display: flex; flex-direction: column; gap: 15px; }
.campo { display: flex; flex-direction: column; gap: 5px; }
.campo label { font-size: 0.9em; font-weight: 600; color: #374151; }
.filas-identicas { display: flex; gap: 15px; }
.filas-identicas .campo { flex: 1; }
.modal-acciones { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.btn-cancelar { padding: 10px 15px; background: #e5e7eb; color: #374151; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-guardar { padding: 10px 15px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
</style>
<template>
  <div class="space-y-4">
    <!-- Barra Superior de Controles y Filtros -->
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <!-- Pestañas de Estado de Stock en Español -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="store.stockFilter === 'all' ? 'btn-neutral' : 'btn-ghost text-slate-600'"
          @click="store.setStockFilter('all')"
        >
          Todos ({{ store.stats.total }})
        </button>
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="store.stockFilter === 'in_stock' ? 'btn-success text-white' : 'btn-ghost text-slate-600'"
          @click="store.setStockFilter('in_stock')"
        >
          Disponibles ({{ store.stats.inStock }})
        </button>
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="store.stockFilter === 'low_stock' ? 'btn-error text-white' : 'btn-ghost text-slate-600'"
          @click="store.setStockFilter('low_stock')"
        >
          Stock Crítico ({{ store.stats.lowStock }})
        </button>
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="store.stockFilter === 'out_of_stock' ? 'btn-neutral' : 'btn-ghost text-slate-600'"
          @click="store.setStockFilter('out_of_stock')"
        >
          Agotados ({{ store.stats.outOfStock }})
        </button>
      </div>
      <!-- Filtro por Categoría e indicador de búsqueda activa -->
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="store.searchQuery"
          class="badge badge-sm badge-info badge-outline gap-1 text-xs"
        >
          Búsqueda: "{{ store.searchQuery }}"
          <button
            type="button"
            class="cursor-pointer ml-1 hover:text-error"
            title="Limpiar búsqueda"
            @click="store.setSearch('')"
          >
            ✕
          </button>
        </span>
        <select
          :value="store.selectedCategory"
          class="select select-bordered select-sm bg-white text-xs font-medium text-slate-700 focus:border-primary shadow-xs"
          aria-label="Filtrar libros por categoría"
          @change="store.setCategory($event.target.value)"
        >
          <option value="all">Todas las categorías</option>
          <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>
    <!-- Banner de Alerta de Stock Crítico -->
    <div
      v-if="store.stats.lowStock > 0 && store.stockFilter !== 'low_stock'"
      class="flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 sm:flex-row sm:items-center shadow-xs"
    >
      <div class="flex items-center gap-3">
        <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <AppIcon name="alert" class="h-4 w-4" />
        </span>
        <div>
          <p class="text-xs sm:text-sm font-semibold text-amber-900">
            Atención: {{ store.stats.lowStock }} título con stock crítico por debajo del mínimo permitido
          </p>
          <p class="text-[11px] text-amber-800/80">
            Revisa el inventario para coordinar pedidos de reposición con los distribuidores.
          </p>
        </div>
      </div>
      <button
        type="button"
        class="btn btn-xs btn-outline border-amber-300 text-amber-800 hover:bg-amber-100"
        @click="store.setStockFilter('low_stock')"
      >
        Ver títulos críticos
      </button>
    </div>
    <!-- Card Principal con Tabla DaisyUI -->
    <div class="card overflow-hidden border border-slate-200 bg-base-100 shadow-sm">
      <!-- Estado de Carga -->
      <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-20 gap-3">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="text-xs font-medium text-slate-500">Cargando catálogo desde la API...</p>
      </div>
      <!-- Estado Vacío -->
      <div
        v-else-if="store.filteredBooks.length === 0"
        class="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <AppIcon name="book" class="h-6 w-6" />
        </span>
        <h3 class="mt-3 text-base font-semibold text-slate-800">No se encontraron libros</h3>
        <p class="mt-1 max-w-sm text-xs text-slate-500">
          No hay libros que coincidan con los filtros seleccionados o el término de búsqueda actual.
        </p>
        <button
          type="button"
          class="btn btn-outline btn-xs mt-4"
          @click="store.resetFilters"
        >
          Restablecer todos los filtros
        </button>
      </div>
      <!-- Tabla de Libros -->
      <div v-else class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <caption class="sr-only">
            Listado de libros con ISBN, categoría, precio, stock y estado
          </caption>
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500">
              <th scope="col" class="font-semibold py-3.5 pl-5">Libro</th>
              <th scope="col" class="font-semibold py-3.5">ISBN</th>
              <th scope="col" class="font-semibold py-3.5">Categoría</th>
              <th scope="col" class="text-right font-semibold py-3.5">Precio</th>
              <th scope="col" class="text-center font-semibold py-3.5">Stock</th>
              <th scope="col" class="font-semibold py-3.5">Estado</th>
              <th scope="col" class="text-right font-semibold py-3.5 pr-5">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-100">
            <tr
              v-for="book in store.paginatedBooks"
              :key="book.id"
              class="hover:bg-teal-50/20 transition-colors"
            >
              <!-- Portada, Título y Autor -->
              <td class="pl-5 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200 shadow-xs relative"
                  >
                    <img
                      :src="book.image"
                      :alt="book.title"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="min-w-0 max-w-xs sm:max-w-sm">
                    <p class="truncate font-semibold text-slate-900 text-xs sm:text-sm">
                      {{ book.title }}
                    </p>
                    <p class="truncate text-xs text-slate-500">
                      {{ book.author }}
                    </p>
                  </div>
                </div>
              </td>
              <!-- ISBN -->
              <td class="font-mono text-xs text-slate-600 whitespace-nowrap">
                {{ book.isbn }}
              </td>
              <!-- Categoría -->
              <td>
                <span class="inline-flex items-center gap-1.5 text-xs text-slate-700">
                  <span class="h-2 w-2 rounded-full bg-primary/70"></span>
                  {{ book.categoryName }}
                </span>
              </td>
              <!-- Precio -->
              <td class="text-right font-mono text-xs sm:text-sm font-semibold tabular text-slate-800 whitespace-nowrap">
                {{ formatPrice(book.price) }}
              </td>
              <!-- Stock -->
              <td class="text-center whitespace-nowrap">
                <span :class="['text-xs sm:text-sm font-semibold tabular', book.stockStatus?.textClass]">
                  {{ book.stock }}
                </span>
                <p class="text-[10px] text-slate-400">mín. {{ book.minStock }}</p>
              </td>
              <!-- Estado (Badge en Español) -->
              <td class="whitespace-nowrap">
                <span :class="['badge badge-sm font-medium', book.stockStatus?.badgeClass]">
                  {{ book.stockStatus?.label }}
                </span>
              </td>
              <!-- Acciones con llamada a Modales -->
              <td class="text-right pr-5 whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs btn-circle text-slate-600 hover:text-primary hover:bg-primary/10"
                    :aria-label="`Editar ${book.title}`"
                    title="Editar libro"
                    @click="openEditModal(book)"
                  >
                    <AppIcon name="edit" class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-error hover:bg-error/10"
                    :aria-label="`Eliminar ${book.title}`"
                    title="Eliminar libro"
                    @click="openDeleteModal(book)"
                  >
                    <AppIcon name="trash" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Barra Inferior de Paginación -->
      <div
        v-if="store.filteredBooks.length > 0"
        class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row bg-slate-50/40"
      >
        <p class="text-xs text-slate-500">
          Mostrando
          <span class="font-medium text-slate-700">{{ store.paginatedBooks.length }}</span>
          de
          <span class="font-medium text-slate-700">{{ store.filteredBooks.length }}</span>
          títulos en inventario
        </p>
        <!-- Join Paginador -->
        <div class="join shadow-xs">
          <button
            type="button"
            class="btn join-item btn-xs sm:btn-sm btn-ghost"
            :disabled="store.currentPage === 1"
            aria-label="Página anterior"
            @click="store.setPage(store.currentPage - 1)"
          >
            «
          </button>
          <button
            v-for="page in store.totalPages"
            :key="page"
            type="button"
            class="btn join-item btn-xs sm:btn-sm"
            :class="page === store.currentPage ? 'btn-primary' : 'btn-ghost'"
            @click="store.setPage(page)"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="btn join-item btn-xs sm:btn-sm btn-ghost"
            :disabled="store.currentPage === store.totalPages"
            aria-label="Página siguiente"
            @click="store.setPage(store.currentPage + 1)"
          >
            »
          </button>
        </div>
      </div>
    </div>
    <!-- Modales incrustados con PROPS y EMITS -->
    <BookModal
      :is-open="isModalOpen"
      :book-to-edit="selectedBook"
      :categories="store.categories"
      :is-saving="store.isSaving"
      @close="closeModal"
      @save="handleSaveBook"
    />
    <ConfirmModal
      :is-open="isDeleteModalOpen"
      title="Eliminar libro del catálogo"
      :message="`¿Estás seguro de que deseas eliminar permanentemente '${bookToDelete?.title}'? Esta acción eliminará el registro de la API.`"
      confirm-label="Eliminar definitivamente"
      :is-loading="store.isDeleting"
      @close="closeDeleteModal"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import BookModal from '@/components/BookModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useBookStore } from '@/stores/useBookStore'
import { useLayoutStore } from '@/stores/useLayoutStore'
const store = useBookStore()
const layout = useLayoutStore()
// Control del estado de los modales
const isModalOpen = ref(false)
const selectedBook = ref(null)
const isDeleteModalOpen = ref(false)
const bookToDelete = ref(null)
// Sincronización con el Layout global
watch(
  () => layout.searchQuery,
  (query) => {
    store.setSearch(query)
  },
)
onMounted(async () => {
  await Promise.all([store.fetchBooks(), store.fetchCategories()])
})
// Control del modal de formulario (Alta / Edición)
function openCreateModal() {
  selectedBook.value = null
  isModalOpen.value = true
}
function openEditModal(book) {
  selectedBook.value = { ...book }
  isModalOpen.value = true
}
function closeModal() {
  isModalOpen.value = false
  selectedBook.value = null
}
async function handleSaveBook(formData) {
  try {
    if (selectedBook.value?.id) {
      await store.updateBook(selectedBook.value.id, formData)
    } else {
      await store.createBook(formData)
    }
    closeModal()
  } catch {
    // Los errores son notificados por useToast en el store
  }
}
// Control del modal de confirmación de eliminación
function openDeleteModal(book) {
  bookToDelete.value = book
  isDeleteModalOpen.value = true
}
function closeDeleteModal() {
  isDeleteModalOpen.value = false
  bookToDelete.value = null
}
async function handleConfirmDelete() {
  if (!bookToDelete.value?.id) return
  try {
    await store.deleteBook(bookToDelete.value.id)
    closeDeleteModal()
  } catch {
    // Notificado en el store
  }
}
// moneda
function formatPrice(value) {
  const num = Number(value) || 0
  return `Bs. ${num.toFixed(2)}`
}
</script>

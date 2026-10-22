<template>
  <div class="space-y-4">
    <!-- Barra Superior de Filtros -->
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="stockFilter === 'all' ? 'btn-neutral' : 'btn-ghost text-slate-600'"
          @click="stockFilter = 'all'"
        >
          Todos ({{ mockBooks.length }})
        </button>
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="stockFilter === 'in_stock' ? 'btn-success text-white' : 'btn-ghost text-slate-600'"
          @click="stockFilter = 'in_stock'"
        >
          Disponibles (2)
        </button>
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="stockFilter === 'low_stock' ? 'btn-error text-white' : 'btn-ghost text-slate-600'"
          @click="stockFilter = 'low_stock'"
        >
          Stock Crítico (1)
        </button>
        <button
          type="button"
          class="btn btn-xs rounded-full px-3"
          :class="stockFilter === 'out_of_stock' ? 'btn-neutral' : 'btn-ghost text-slate-600'"
          @click="stockFilter = 'out_of_stock'"
        >
          Agotados (1)
        </button>
      </div>
      <!-- Selector de Categoría -->
      <div>
        <select
          v-model="selectedCategory"
          class="select select-bordered select-sm bg-white text-xs font-medium text-slate-700 shadow-xs"
        >
          <option value="all">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>
    <!-- Banner de Alerta Visual de Stock Crítico -->
    <div
      v-if="stockFilter !== 'low_stock'"
      class="flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 sm:flex-row sm:items-center shadow-xs"
    >
      <div class="flex items-center gap-3">
        <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <AppIcon name="alert" class="h-4 w-4" />
        </span>
        <div>
          <p class="text-xs sm:text-sm font-semibold text-amber-900">
            Atención: 1 título con stock crítico por debajo del mínimo permitido
          </p>
          <p class="text-[11px] text-amber-800/80">
            Revisa el inventario para coordinar pedidos de reposición con los distribuidores.
          </p>
        </div>
      </div>
      <button
        type="button"
        class="btn btn-xs btn-outline border-amber-300 text-amber-800 hover:bg-amber-100"
        @click="stockFilter = 'low_stock'"
      >
        Ver títulos críticos
      </button>
    </div>
    <!-- Card con Tabla DaisyUI -->
    <div class="card overflow-hidden border border-slate-200 bg-base-100 shadow-sm">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
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
            <tr v-for="book in filteredBooks" :key="book.id" class="hover:bg-teal-50/20">
              <td class="pl-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
                    <img :src="book.image" :alt="book.title" class="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900 text-xs sm:text-sm">{{ book.title }}</p>
                    <p class="text-xs text-slate-500">{{ book.author }}</p>
                  </div>
                </div>
              </td>
              <td class="font-mono text-xs text-slate-600">{{ book.isbn }}</td>
              <td>
                <span class="inline-flex items-center gap-1.5 text-xs text-slate-700">
                  <span class="h-2 w-2 rounded-full bg-primary/70"></span>
                  {{ book.categoryName }}
                </span>
              </td>
              <td class="text-right font-mono text-xs sm:text-sm font-semibold tabular text-slate-800">
                {{ formatPrice(book.price) }}
              </td>
              <td class="text-center">
                <span :class="['text-xs sm:text-sm font-semibold tabular', book.stockStatus.textClass]">
                  {{ book.stock }}
                </span>
                <p class="text-[10px] text-slate-400">mín. {{ book.minStock }}</p>
              </td>
              <td>
                <span :class="['badge badge-sm font-medium', book.stockStatus.badgeClass]">
                  {{ book.stockStatus.label }}
                </span>
              </td>
              <td class="text-right pr-5">
                <div class="flex items-center justify-end gap-1">
                  <button type="button" class="btn btn-ghost btn-xs btn-circle text-slate-600" title="Editar libro">
                    <AppIcon name="edit" class="h-3.5 w-3.5" />
                  </button>
                  <button type="button" class="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-error" title="Eliminar libro">
                    <AppIcon name="trash" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Barra Inferior de Paginación -->
      <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row bg-slate-50/40">
        <p class="text-xs text-slate-500">
          Mostrando <span class="font-medium text-slate-700">{{ filteredBooks.length }}</span> de <span class="font-medium text-slate-700">{{ mockBooks.length }}</span> títulos
        </p>
        <div class="join shadow-xs">
          <button type="button" class="btn join-item btn-xs sm:btn-sm btn-ghost" disabled>«</button>
          <button type="button" class="btn join-item btn-xs sm:btn-sm btn-primary">1</button>
          <button type="button" class="btn join-item btn-xs sm:btn-sm btn-ghost" disabled>»</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { useLayoutStore } from '@/stores/useLayoutStore'

const layout = useLayoutStore()

// Filtros reactivos locales
const stockFilter = ref('all')
const selectedCategory = ref('all')

// Categorías locales para el maquetado
const categories = ref([
  { id: 1, name: 'Novela y Ficción' },
  { id: 2, name: 'Ciencia y Tecnología' },
  { id: 3, name: 'Historia y Ensayo' },
  { id: 4, name: 'Infantil y Juvenil' },
  { id: 5, name: 'Arte y Poesía' },
])
// Catálogo de prueba simulado
const mockBooks = ref([
  {
    id: 1,
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '978-84-397-2163-2',
    categoryName: 'Novela y Ficción',
    categoryId: 1,
    price: 89,
    stock: 12,
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    stockStatus: { label: 'Disponible', badgeClass: 'badge-success', textClass: 'text-success font-medium' },
  },
  {
    id: 2,
    title: 'El principito',
    author: 'Antoine de Saint-Exupéry',
    isbn: '978-84-206-7151-1',
    categoryName: 'Infantil y Juvenil',
    categoryId: 4,
    price: 45,
    stock: 2,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    stockStatus: { label: 'Stock Crítico', badgeClass: 'badge-error', textClass: 'text-error font-semibold' },
  },
  {
    id: 3,
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    isbn: '978-84-376-0494-7',
    categoryName: 'Historia y Ensayo',
    categoryId: 3,
    price: 110,
    stock: 7,
    minStock: 3,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
    stockStatus: { label: 'Disponible', badgeClass: 'badge-success', textClass: 'text-success font-medium' },
  },
  {
    id: 4,
    title: 'Rayuela',
    author: 'Julio Cortázar',
    isbn: '978-84-204-7189-0',
    categoryName: 'Novela y Ficción',
    categoryId: 1,
    price: 75,
    stock: 0,
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    stockStatus: { label: 'Agotado', badgeClass: 'badge-ghost', textClass: 'text-slate-400 font-medium' },
  },
])
// Filtrado reactivo en memoria
const filteredBooks = computed(() => {
  return mockBooks.value.filter((b) => {
    if (selectedCategory.value !== 'all' && b.categoryId !== Number(selectedCategory.value)) {
      return false
    }
    if (stockFilter.value === 'in_stock' && b.stock <= b.minStock) return false
    if (stockFilter.value === 'low_stock' && (b.stock > b.minStock || b.stock === 0)) return false
    if (stockFilter.value === 'out_of_stock' && b.stock > 0) return false
    return true
  })
})
function formatPrice(val) {
  return `Bs. ${Number(val).toFixed(2)}`
}
</script>

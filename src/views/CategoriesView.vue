<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="card border border-slate-200 bg-base-100 shadow-sm">
        <div class="card-body flex-row items-center gap-3 p-4">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <AppIcon name="tag" class="h-5 w-5" />
          </span>
          <div>
            <p class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Categorías</p>
            <p class="text-xl font-semibold tabular text-slate-900">{{ store.stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="card border border-slate-200 bg-base-100 shadow-sm">
        <div class="card-body flex-row items-center gap-3 p-4">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AppIcon name="book" class="h-5 w-5" />
          </span>
          <div>
            <p class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Libros asociados</p>
            <p class="text-xl font-semibold tabular text-slate-900">{{ store.stats.totalBooks }}</p>
          </div>
        </div>
      </div>

      <div class="card border border-slate-200 bg-base-100 shadow-sm">
        <div class="card-body flex-row items-center gap-3 p-4">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <AppIcon name="search" class="h-5 w-5" />
          </span>
          <div>
            <p class="text-[11px] font-medium uppercase tracking-wider text-slate-500">Resultados</p>
            <p class="text-xl font-semibold tabular text-slate-900">{{ store.stats.results }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="store.searchQuery" class="badge badge-sm badge-info badge-outline gap-1 text-xs">
          Búsqueda: "{{ store.searchQuery }}"
          <button
            type="button"
            class="cursor-pointer ml-1 hover:text-error"
            title="Limpiar búsqueda"
            @click="store.resetSearch"
          >
            ✕
          </button>
        </span>
        <p v-else class="text-xs text-slate-500">
          Organiza los libros por género, colección o sección de la librería.
        </p>
      </div>

      <button type="button" class="btn btn-primary btn-sm gap-2" @click="openCreateModal">
        <AppIcon name="plus" class="h-4 w-4" />
        Nueva categoría
      </button>
    </div>

    <div v-if="store.isLoading" class="card border border-slate-200 bg-base-100 shadow-sm">
      <div class="flex flex-col items-center justify-center gap-3 py-20">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="text-xs font-medium text-slate-500">Cargando categorías desde la API...</p>
      </div>
    </div>

    <div
      v-else-if="store.filteredCategories.length === 0"
      class="card border border-slate-200 bg-base-100 shadow-sm"
    >
      <div class="flex flex-col items-center justify-center px-4 py-16 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <AppIcon name="tag" class="h-6 w-6" />
        </span>
        <h3 class="mt-3 text-base font-semibold text-slate-800">No se encontraron categorías</h3>
        <p class="mt-1 max-w-sm text-xs text-slate-500">
          No hay categorías que coincidan con la búsqueda actual.
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button v-if="store.searchQuery" type="button" class="btn btn-outline btn-xs" @click="store.resetSearch">
            Limpiar búsqueda
          </button>
          <button type="button" class="btn btn-primary btn-xs gap-1.5" @click="openCreateModal">
            <AppIcon name="plus" class="h-3.5 w-3.5" />
            Crear categoría
          </button>
        </div>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="category in store.filteredCategories"
        :key="category.id"
        class="card overflow-hidden border border-slate-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
      >
        <figure class="relative h-40 overflow-hidden bg-slate-100">
          <img
            :src="category.image || DEFAULT_CATEGORY_IMAGE"
            :alt="category.name"
            class="h-full w-full object-cover"
            loading="lazy"
            @error="handleImageError"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent"></div>
          <span class="badge badge-sm absolute right-3 top-3 border-0 bg-white/90 font-mono text-[10px] text-slate-700">
            ID {{ category.id }}
          </span>
          <figcaption class="absolute bottom-3 left-4 right-4">
            <h3 class="truncate font-display text-lg font-semibold text-white">{{ category.name }}</h3>
            <p class="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-200">
              <AppIcon name="book" class="h-3 w-3" />
              {{ category.productCount }} {{ category.productCount === 1 ? 'libro asociado' : 'libros asociados' }}
            </p>
          </figcaption>
        </figure>

        <div class="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
          <span class="truncate font-mono text-[10px] text-slate-400">
            {{ category.slug || 'sin-slug' }}
          </span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-circle text-slate-600 hover:bg-primary/10 hover:text-primary"
              :aria-label="`Editar ${category.name}`"
              title="Editar categoría"
              @click="openEditModal(category)"
            >
              <AppIcon name="edit" class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-circle text-slate-400 hover:bg-error/10 hover:text-error"
              :aria-label="`Eliminar ${category.name}`"
              title="Eliminar categoría"
              @click="openDeleteModal(category)"
            >
              <AppIcon name="trash" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <CategoryModal
      :is-open="isModalOpen"
      :category-to-edit="selectedCategory"
      :is-saving="store.isSaving"
      @close="closeModal"
      @save="handleSaveCategory"
    />

    <ConfirmModal
      :is-open="isDeleteModalOpen"
      title="Eliminar categoría"
      :message="deleteMessage"
      confirm-label="Eliminar categoría"
      :is-loading="store.isDeleting"
      @close="closeDeleteModal"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import CategoryModal from '@/components/CategoryModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { DEFAULT_CATEGORY_IMAGE } from '@/models/Category'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useLayoutStore } from '@/stores/useLayoutStore'

const store = useCategoryStore()
const layout = useLayoutStore()

const isModalOpen = ref(false)
const selectedCategory = ref(null)
const isDeleteModalOpen = ref(false)
const categoryToDelete = ref(null)

const deleteMessage = computed(() => {
  const category = categoryToDelete.value
  if (!category) return ''

  const count = category.productCount || 0
  if (count === 0) {
    return `¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`
  }

  const label = count === 1 ? '1 libro asociado' : `${count} libros asociados`
  return `¿Eliminar la categoría "${category.name}"? Tiene ${label}; la API podría rechazar la operación si aún hay productos vinculados.`
})

watch(
  () => layout.searchQuery,
  (query) => {
    store.setSearch(query)
  },
)

watch(
  () => layout.actionTick,
  () => {
    openCreateModal()
  },
)

onMounted(async () => {
  await store.fetchCategories()
})

function openCreateModal() {
  selectedCategory.value = null
  isModalOpen.value = true
}

function openEditModal(category) {
  selectedCategory.value = { ...category }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedCategory.value = null
}

async function handleSaveCategory(formData) {
  try {
    if (selectedCategory.value?.id != null) {
      await store.updateCategory(selectedCategory.value.id, formData)
    } else {
      await store.createCategory(formData)
    }
    closeModal()
  } catch {
    // Notificado en useCategoryStore
  }
}

function openDeleteModal(category) {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}

async function handleConfirmDelete() {
  if (categoryToDelete.value?.id == null) return
  try {
    await store.deleteCategory(categoryToDelete.value.id)
    closeDeleteModal()
  } catch {
    // Notificado en useCategoryStore
  }
}

function handleImageError(event) {
  event.target.onerror = null
  event.target.src = DEFAULT_CATEGORY_IMAGE
}
</script>

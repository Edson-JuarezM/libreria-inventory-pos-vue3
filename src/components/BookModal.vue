<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
    <div
      class="modal-box max-h-[92vh] max-w-2xl overflow-y-auto border border-slate-200 p-0 shadow-2xl bg-base-100"
    >
      <!-- Encabezado del Modal -->
      <div class="flex items-start justify-between border-b border-slate-200 px-6 py-5 bg-slate-50/50">
        <div>
          <h3 class="font-display text-xl text-slate-900 font-bold">
            {{ isEditing ? 'Editar libro' : 'Nuevo libro' }}
          </h3>
          <p class="mt-0.5 text-xs text-slate-500">
            {{
              isEditing
                ? 'Actualiza los datos del título en el catálogo.'
                : 'Completa los datos para registrar un título en el inventario.'
            }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-circle"
          aria-label="Cerrar ventana modal"
          :disabled="isSaving"
          @click="handleClose"
        >
          <AppIcon name="x" class="h-4 w-4" />
        </button>
      </div>

      <!-- Formulario -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div v-if="formError" class="alert alert-error text-xs py-2 px-3 shadow-sm rounded-lg">
          <AppIcon name="alert" class="h-4 w-4" />
          <span>{{ formError }}</span>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Título -->
          <div class="sm:col-span-2">
            <label for="modalBookTitle" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Título del libro <span class="text-error">*</span>
            </label>
            <input
              id="modalBookTitle"
              v-model="form.title"
              type="text"
              required
              class="input input-bordered w-full bg-white text-sm focus:border-primary"
              placeholder="Ej. Cien años de soledad"
            />
          </div>

          <!-- Autor -->
          <div>
            <label for="modalBookAuthor" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Autor / Editorial <span class="text-error">*</span>
            </label>
            <input
              id="modalBookAuthor"
              v-model="form.author"
              type="text"
              required
              class="input input-bordered w-full bg-white text-sm focus:border-primary"
              placeholder="Ej. Gabriel García Márquez"
            />
          </div>

          <!-- ISBN -->
          <div>
            <label for="modalBookIsbn" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Código ISBN
            </label>
            <input
              id="modalBookIsbn"
              v-model="form.isbn"
              type="text"
              class="input input-bordered w-full bg-white font-mono text-xs focus:border-primary"
              placeholder="978-84-397-2163-2"
            />
          </div>

          <!-- Categoría -->
          <div>
            <label for="modalBookCategory" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Categoría <span class="text-error">*</span>
            </label>
            <select
              id="modalBookCategory"
              v-model="form.categoryId"
              required
              class="select select-bordered w-full bg-white text-sm focus:border-primary"
            >
              <option disabled value="">Selecciona categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Precio -->
          <div>
            <label for="modalBookPrice" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Precio (Bs.) <span class="text-error">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                Bs.
              </span>
              <input
                id="modalBookPrice"
                v-model.number="form.price"
                type="number"
                min="0.5"
                step="0.5"
                required
                class="input input-bordered w-full bg-white pl-10 text-sm focus:border-primary"
                placeholder="85.00"
              />
            </div>
          </div>

          <!-- Stock Inicial -->
          <div>
            <label for="modalBookStock" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Stock actual <span class="text-error">*</span>
            </label>
            <input
              id="modalBookStock"
              v-model.number="form.stock"
              type="number"
              min="0"
              step="1"
              required
              class="input input-bordered w-full bg-white text-sm focus:border-primary"
              placeholder="12"
            />
          </div>

          <!-- Stock Mínimo -->
          <div>
            <label for="modalBookMinStock" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Stock mínimo (para alerta)
            </label>
            <input
              id="modalBookMinStock"
              v-model.number="form.minStock"
              type="number"
              min="0"
              step="1"
              class="input input-bordered w-full bg-white text-sm focus:border-primary"
              placeholder="4"
            />
          </div>

          <!-- Portada (URL) -->
          <div class="sm:col-span-2">
            <label for="modalBookImage" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              URL de imagen de portada
            </label>
            <div class="flex gap-3">
              <input
                id="modalBookImage"
                v-model="form.image"
                type="url"
                class="input input-bordered flex-1 bg-white text-xs focus:border-primary"
                placeholder="https://ejemplo.com/portada.jpg"
              />
              <div
                v-if="form.image"
                class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                <img :src="form.image" alt="Vista previa de portada" class="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <!-- Sinopsis / Reseña -->
          <div class="sm:col-span-2">
            <label for="modalBookSynopsis" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Sinopsis o reseña
            </label>
            <textarea
              id="modalBookSynopsis"
              v-model="form.synopsis"
              rows="3"
              class="textarea textarea-bordered w-full bg-white text-sm focus:border-primary"
              placeholder="Breve reseña del contenido del libro..."
            ></textarea>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            :disabled="isSaving"
            @click="handleClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-sm gap-2"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <AppIcon v-else name="check" class="h-4 w-4" />
            <span>{{ isEditing ? 'Guardar cambios' : 'Registrar libro' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Cierre por fondo -->
    <form method="dialog" class="modal-backdrop">
      <button :disabled="isSaving" @click="handleClose">cerrar</button>
    </form>
  </dialog>
</template>

<script setup>
import { reactive, watch, ref, computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  bookToEdit: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

const defaultForm = () => ({
  id: null,
  title: '',
  author: '',
  isbn: '',
  categoryId: '',
  price: 50,
  stock: 10,
  minStock: 4,
  image: '',
  synopsis: '',
})

const form = reactive(defaultForm())
const formError = ref('')

const isEditing = computed(() => Boolean(props.bookToEdit && props.bookToEdit.id))

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      formError.value = ''
      if (props.bookToEdit) {
        form.id = props.bookToEdit.id
        form.title = props.bookToEdit.title || ''
        form.author = props.bookToEdit.author || ''
        form.isbn = props.bookToEdit.isbn || ''
        form.categoryId = props.bookToEdit.categoryId || (props.categories[0]?.id ?? '')
        form.price = props.bookToEdit.price ?? 50
        form.stock = props.bookToEdit.stock ?? 10
        form.minStock = props.bookToEdit.minStock ?? 4
        form.image = props.bookToEdit.image || ''
        form.synopsis = props.bookToEdit.synopsis || ''
      } else {
        Object.assign(form, defaultForm())
        if (props.categories.length > 0) {
          form.categoryId = props.categories[0].id
        }
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  formError.value = ''

  if (!form.title.trim()) {
    formError.value = 'El título del libro es obligatorio.'
    return
  }
  if (!form.author.trim()) {
    formError.value = 'El nombre del autor es obligatorio.'
    return
  }
  if (!form.categoryId) {
    formError.value = 'Selecciona una categoría para el libro.'
    return
  }
  if (Number(form.price) <= 0) {
    formError.value = 'El precio debe ser mayor a 0 Bs.'
    return
  }
  if (Number(form.stock) < 0) {
    formError.value = 'El stock no puede ser un número negativo.'
    return
  }

  emit('save', { ...form })
}

function handleClose() {
  if (props.isSaving) return
  emit('close')
}
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
    <div
      class="modal-box max-h-[92vh] max-w-lg overflow-y-auto border border-slate-200 p-0 shadow-2xl bg-base-100"
    >
      <div class="flex items-start justify-between border-b border-slate-200 px-6 py-5 bg-slate-50/50">
        <div>
          <h3 class="font-display text-xl text-slate-900 font-bold">
            {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
          </h3>
          <p class="mt-0.5 text-xs text-slate-500">
            {{
              isEditing
                ? 'Actualiza el nombre o la imagen de la categoría.'
                : 'Registra una nueva sección para organizar el catálogo.'
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

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div v-if="formError" class="alert alert-error text-xs py-2 px-3 shadow-sm rounded-lg" role="alert">
          <AppIcon name="alert" class="h-4 w-4" />
          <span>{{ formError }}</span>
        </div>

        <div>
          <label
            for="categoryName"
            class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Nombre de la categoría <span class="text-error">*</span>
          </label>
          <input
            id="categoryName"
            v-model="form.name"
            type="text"
            required
            minlength="2"
            maxlength="60"
            class="input input-bordered w-full bg-white text-sm focus:border-primary"
            placeholder="Ej. Novelas, Papelería, Textos escolares"
          />
        </div>

        <div>
          <label
            for="categoryImage"
            class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            URL de la imagen <span class="text-error">*</span>
          </label>
          <input
            id="categoryImage"
            v-model="form.image"
            type="url"
            required
            class="input input-bordered w-full bg-white text-xs focus:border-primary"
            placeholder="https://ejemplo.com/categoria.jpg"
          />
        </div>

        <div
          class="relative h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        >
          <img
            v-if="form.image"
            :src="form.image"
            :alt="`Vista previa de ${form.name || 'la categoría'}`"
            class="h-full w-full object-cover"
            @error="handleImageError"
          />
          <div
            v-else
            class="flex h-full flex-col items-center justify-center gap-2 text-slate-400"
          >
            <AppIcon name="tag" class="h-8 w-8" />
            <span class="text-xs">Vista previa de la imagen</span>
          </div>
        </div>

        <div
          class="sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end"
        >
          <button type="button" class="btn btn-ghost btn-sm" :disabled="isSaving" @click="handleClose">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary btn-sm gap-2" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
            <AppIcon v-else name="check" class="h-4 w-4" />
            <span>{{ isEditing ? 'Guardar cambios' : 'Crear categoría' }}</span>
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button :disabled="isSaving" @click="handleClose">cerrar</button>
    </form>
  </dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { DEFAULT_CATEGORY_IMAGE, validateCategory } from '@/models/Category'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  categoryToEdit: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

const form = reactive({ name: '', image: '' })
const formError = ref('')

const isEditing = computed(() => Boolean(props.categoryToEdit?.id))

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return

    formError.value = ''
    form.name = props.categoryToEdit?.name || ''
    form.image = props.categoryToEdit?.image || ''
  },
  { immediate: true },
)

function handleSubmit() {
  const validationError = validateCategory(form)
  if (validationError) {
    formError.value = validationError
    return
  }

  formError.value = ''
  emit('save', { ...form })
}

function handleImageError(event) {
  event.target.onerror = null
  event.target.src = DEFAULT_CATEGORY_IMAGE
}

function handleClose() {
  if (props.isSaving) return
  emit('close')
}
</script>

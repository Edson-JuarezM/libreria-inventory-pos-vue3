<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
    <div class="modal-box border border-slate-200 p-6 shadow-2xl bg-base-100 max-w-md">
      <div class="flex items-start gap-4">
        <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-error/10 text-error">
          <AppIcon name="trash" class="h-6 w-6" />
        </span>
        <div class="flex-1">
          <h3 class="font-display text-lg text-slate-900 font-semibold">{{ title }}</h3>
          <p class="mt-1 text-sm text-slate-600 leading-relaxed">{{ message }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :disabled="isLoading"
          @click="handleClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-error btn-sm text-white gap-2"
          :disabled="isLoading"
          @click="handleConfirm"
        >
          <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
          <AppIcon v-else name="trash" class="h-4 w-4" />
          <span>{{ confirmLabel }}</span>
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button :disabled="isLoading" @click="handleClose">cerrar</button>
    </form>
  </dialog>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '¿Confirmar acción?' },
  message: { type: String, default: 'Esta acción no se puede deshacer.' },
  confirmLabel: { type: String, default: 'Eliminar' },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirm'])

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  emit('close')
}
</script>

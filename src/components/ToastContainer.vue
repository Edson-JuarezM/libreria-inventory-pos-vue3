<script setup>
import { useToast } from '@/composables/useToast'
import AppIcon from './AppIcon.vue'

const { toasts, remove } = useToast()

const ALERT_CLASSES = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
  warning: 'alert-warning',
}

const ICONS = {
  success: 'check',
  error: 'alert',
  info: 'alert',
  warning: 'alert',
}
</script>

<template>
  <div
    class="toast toast-end toast-top z-[100] w-[22rem] max-w-[calc(100vw-2rem)]"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item alert pointer-events-auto shadow-lg"
        :class="ALERT_CLASSES[toast.type]"
        role="status"
      >
        <AppIcon :name="ICONS[toast.type]" class="h-5 w-5 flex-shrink-0" />
        <span class="min-w-0 flex-1 text-sm font-medium leading-snug">{{ toast.message }}</span>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-circle"
          aria-label="Cerrar notificación"
          @click="remove(toast.id)"
        >
          <AppIcon name="x" class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>

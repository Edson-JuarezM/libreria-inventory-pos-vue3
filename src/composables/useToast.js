import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 1

function remove(id) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

function push(message, type = 'success', duration = 3200) {
  const id = nextId++
  toasts.push({ id, message, type })

  while (toasts.length > 3) toasts.shift()

  setTimeout(() => remove(id), duration)
  return id
}

/**
 * Contrato compartido: cualquier integrante puede importar `useToast` y llamar
 * success / error / info / warning. El `ToastContainer` del MainLayout los pinta.
 */
export function useToast() {
  return {
    toasts,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
    info: (message) => push(message, 'info'),
    warning: (message) => push(message, 'warning'),
    remove,
  }
}

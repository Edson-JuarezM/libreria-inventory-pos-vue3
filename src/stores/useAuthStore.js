import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'

const STORAGE_KEY = 'aurea-auth'

const ROLE_LABELS = {
  admin: 'Administrador',
  customer: 'Cajero',
}

function readStoredSession() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (raw) return { ...JSON.parse(raw), remember: storage === localStorage }
    } catch {
      storage.removeItem(STORAGE_KEY)
    }
  }
  return null
}

function resolveError(error) {
  if (error?.response?.status === 401) return 'Correo o contraseña incorrectos.'
  if (error?.response) {
    return 'No se pudo iniciar sesión. Revisa los datos e intenta de nuevo.'
  }
  return 'No se pudo conectar con el servidor. Intenta de nuevo.'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const refreshToken = ref('')
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const loginAt = ref(null)
  const remember = ref(true)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const roleLabel = computed(() => ROLE_LABELS[user.value?.role] || 'Usuario')
  const displayName = computed(() => user.value?.name || user.value?.email || 'Usuario')
  const initials = computed(() => {
    const source = displayName.value.trim()
    const parts = source.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'LA'
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  })
  const turnStartedAt = computed(() => {
    if (!loginAt.value) return ''
    return new Date(loginAt.value).toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  })

  function persist() {
    const payload = JSON.stringify({
      token: token.value,
      refreshToken: refreshToken.value,
      user: user.value,
      loginAt: loginAt.value,
    })
    const target = remember.value ? localStorage : sessionStorage
    const other = remember.value ? sessionStorage : localStorage
    target.setItem(STORAGE_KEY, payload)
    other.removeItem(STORAGE_KEY)
  }

  function clearSession() {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    loginAt.value = null
    error.value = null
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  async function fetchProfile() {
    const profile = await authService.getProfile()
    user.value = profile
    return profile
  }

  async function login(email, password, keepSession = true) {
    loading.value = true
    error.value = null
    remember.value = keepSession

    try {
      const session = await authService.login({ email, password })
      token.value = session.access_token
      refreshToken.value = session.refresh_token
      await fetchProfile()
      loginAt.value = new Date().toISOString()
      initialized.value = true
      persist()
      return true
    } catch (err) {
      clearSession()
      error.value = resolveError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clearSession()
  }

  let restoreTask = null

  async function restore() {
    const stored = readStoredSession()

    if (!stored?.token) {
      initialized.value = true
      return false
    }

    token.value = stored.token
    refreshToken.value = stored.refreshToken || ''
    user.value = stored.user || null
    loginAt.value = stored.loginAt || null
    remember.value = stored.remember

    try {
      await fetchProfile()
      persist()
      initialized.value = true
      return true
    } catch {
      clearSession()
      initialized.value = true
      return false
    }
  }

  function restoreSession() {
    if (initialized.value) return Promise.resolve(isAuthenticated.value)
    if (!restoreTask) {
      restoreTask = restore().finally(() => {
        restoreTask = null
      })
    }
    return restoreTask
  }

  return {
    token,
    refreshToken,
    user,
    loading,
    error,
    loginAt,
    remember,
    initialized,
    isAuthenticated,
    isAdmin,
    roleLabel,
    displayName,
    initials,
    turnStartedAt,
    login,
    fetchProfile,
    logout,
    restoreSession,
  }
})

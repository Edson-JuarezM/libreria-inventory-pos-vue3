import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://api.escuelajs.co/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  // Importación diferida para evitar dependencia circular con el store.
  const { useAuthStore } = await import('@/stores/useAuthStore')
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Un 401 de /auth/login son credenciales inválidas, no una sesión vencida.
    const isLoginRequest = String(error.config?.url || '').includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      const { useAuthStore } = await import('@/stores/useAuthStore')
      const auth = useAuthStore()
      auth.logout()

      const { default: router } = await import('@/router')
      const current = router.currentRoute.value.fullPath
      if (current !== '/login') {
        router.push({ path: '/login', query: { redirect: current } })
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient

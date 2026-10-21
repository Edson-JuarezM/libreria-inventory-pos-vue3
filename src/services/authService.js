import apiClient from './apiClient'

/**
 * login({ email, password }) → POST /auth/login → { access_token, refresh_token }
 */
export async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }
}

/**
 * getProfile() → GET /auth/profile → { id, name, email, role, avatar }
 */
export async function getProfile() {
  const { data } = await apiClient.get('/auth/profile')
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar,
  }
}

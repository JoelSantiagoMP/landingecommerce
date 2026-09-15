import axios from 'axios'

const TOKEN_KEY = 'torque-admin-token'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * Base URL de la API.
 * - Dev: usa el proxy de Vite (`/api` → localhost:8000) si no hay VITE_API_URL.
 * - Prod (Vercel): requiere VITE_API_URL, p. ej. https://TU-SERVICIO.onrender.com/api/v1
 */
function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return '/api/v1'
  }
  console.error(
    '[CASA WOD] Falta VITE_API_URL en el build de producción. ' +
      'Configúrala en Vercel → Settings → Environment Variables.',
  )
  return '/api/v1'
}

export const API_BASE_URL = resolveApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getCategorias = () => api.get('/categorias/')
export const getProductos = (params = {}) => api.get('/productos/', { params })
export const createProducto = (payload) => api.post('/productos/', payload)
export const updateProducto = (id, payload) => api.put(`/productos/${id}`, payload)
export const deleteProducto = (id) => api.delete(`/productos/${id}`)

export const createCheckout = (payload) => api.post('/checkout/', payload)
export const getOrdenes = (params = {}) => api.get('/checkout/', { params })
export const updateOrdenEstado = (uuid, estado) =>
  api.patch(`/checkout/${uuid}/estado`, { estado })

export const loginAdmin = (email, password) => {
  const body = new URLSearchParams()
  body.append('username', email)
  body.append('password', password)
  return api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const getMe = () => api.get('/auth/me')

export default api

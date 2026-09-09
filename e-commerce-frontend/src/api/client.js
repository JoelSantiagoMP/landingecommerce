import axios from 'axios'

const TOKEN_KEY = 'torque-admin-token'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)
export const setStoredToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY)

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

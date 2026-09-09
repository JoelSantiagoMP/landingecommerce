import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  clearStoredToken,
  getMe,
  getStoredToken,
  loginAdmin,
  setStoredToken,
} from '../api/client'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: getStoredToken(),
      user: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await loginAdmin(email, password)
          setStoredToken(data.access_token)
          set({ token: data.access_token })
          const me = await getMe()
          set({ user: me.data, loading: false })
          return true
        } catch (err) {
          clearStoredToken()
          set({
            token: null,
            user: null,
            loading: false,
            error:
              err?.response?.data?.detail ||
              'No se pudo iniciar sesión. Verifica tus credenciales.',
          })
          return false
        }
      },

      logout: () => {
        clearStoredToken()
        set({ token: null, user: null, error: null })
      },

      hydrateUser: async () => {
        const token = get().token || getStoredToken()
        if (!token) {
          set({ token: null, user: null })
          return false
        }
        set({ token, loading: true, error: null })
        try {
          const me = await getMe()
          set({ user: me.data, loading: false })
          return true
        } catch {
          clearStoredToken()
          set({ token: null, user: null, loading: false })
          return false
        }
      },
    }),
    {
      name: 'torque-auth',
      partialize: (state) => ({ token: state.token }),
    },
  ),
)

export default useAuthStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Precio unitario efectivo: oferta si existe, si no precio de venta. */
export const getUnitPrice = (product) => {
  if (product?.precio_oferta != null && product.precio_oferta > 0) {
    return Number(product.precio_oferta)
  }
  return Number(product?.precio_venta ?? 0)
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isCheckoutOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      addItem: (product, quantity = 1) => {
        const qty = Math.max(1, Number(quantity) || 1)
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + qty }
                  : item,
              ),
              isCartOpen: true,
            }
          }

          return {
            items: [
              ...state.items,
              {
                id: product.id,
                nombre: product.nombre,
                imagen_url: product.imagen_url,
                precio_venta: product.precio_venta,
                precio_oferta: product.precio_oferta,
                stock: product.stock,
                quantity: qty,
              },
            ],
            isCartOpen: true,
          }
        })
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      updateQty: (productId, quantity) => {
        const qty = Number(quantity)
        if (!Number.isFinite(qty) || qty < 1) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: qty } : item,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () =>
        get().items.reduce(
          (sum, item) => sum + getUnitPrice(item) * item.quantity,
          0,
        ),
    }),
    {
      name: 'torque-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export default useCartStore

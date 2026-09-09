import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import useCartStore, { formatMoney, getUnitPrice } from '../store/useCartStore'

export default function CartDrawer() {
  const isCartOpen = useCartStore((s) => s.isCartOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const openCheckout = useCartStore((s) => s.openCheckout)
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useCartStore((s) => s.getTotal())

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Cerrar carrito"
        onClick={closeCart}
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-panel animate-[slideIn_0.25s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="font-display text-2xl font-bold tracking-wide">Tu carrito</p>
            <p className="text-sm text-ink-soft">{items.length} referencia(s)</p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-ink-soft hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-ink-soft">
              <ShoppingBag className="h-10 w-10 opacity-40" />
              <p className="text-sm">Aún no has agregado repuestos.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const unit = getUnitPrice(item)
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden bg-surface-muted">
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                          N/A
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate font-semibold text-ink">{item.nombre}</h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 transition hover:text-red-600"
                          aria-label={`Quitar ${item.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-0.5 text-sm text-primary font-semibold">
                        {formatMoney(unit)}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center border border-slate-200"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center border border-slate-200"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="ml-auto text-sm font-bold">
                          {formatMoney(unit * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 bg-surface px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink-soft">Total</span>
            <span className="font-display text-3xl font-extrabold text-ink">
              {formatMoney(total)}
            </span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={openCheckout}
            className="w-full bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Ir al checkout
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

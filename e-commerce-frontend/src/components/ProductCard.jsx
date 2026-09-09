import { Plus, Tag } from 'lucide-react'
import useCartStore, { formatMoney, getUnitPrice } from '../store/useCartStore'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const hasOffer =
    product.precio_oferta != null && product.precio_oferta > 0
  const unitPrice = getUnitPrice(product)
  const outOfStock = product.stock <= 0

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200/90 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-panel">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-500">
            Sin imagen
          </div>
        )}

        {hasOffer && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-amber-400 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
            <Tag className="h-3 w-3" />
            Oferta
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="font-display text-xl font-bold leading-tight tracking-wide text-ink">
            {product.nombre}
          </h3>
          {product.descripcion && (
            <p className="line-clamp-2 text-sm text-ink-soft">{product.descripcion}</p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-extrabold text-primary">
              {formatMoney(unitPrice)}
            </p>
            {hasOffer && (
              <p className="text-xs text-slate-400 line-through">
                {formatMoney(product.precio_venta)}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-soft">
              {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </p>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addItem(product)}
            className="inline-flex items-center gap-1.5 bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>
    </article>
  )
}

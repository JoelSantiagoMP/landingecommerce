import { useState } from 'react'
import { Eye, Plus, Tag } from 'lucide-react'
import useCartStore, { formatMoney, getUnitPrice } from '../store/useCartStore'
import ProductDetailModal from './ProductDetailModal'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [fichaOpen, setFichaOpen] = useState(false)
  const hasOffer =
    product.precio_oferta != null && product.precio_oferta > 0
  const unitPrice = getUnitPrice(product)
  const outOfStock = product.stock <= 0

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden border border-surface-border bg-surface-raised transition duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {product.imagen_url ? (
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-muted text-sm font-semibold text-ink-soft">
              Sin imagen
            </div>
          )}

          {hasOffer && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <Tag className="h-3 w-3" />
              Oferta
            </span>
          )}

          {product.marca_fabricante && (
            <span className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft backdrop-blur-sm">
              {product.marca_fabricante}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold italic leading-tight tracking-wide text-white">
              {product.nombre}
            </h3>
            {product.descripcion && (
              <p className="line-clamp-2 text-sm text-ink-soft">{product.descripcion}</p>
            )}
          </div>

          <div className="mt-auto space-y-3">
            <div>
              <p className="font-display text-2xl font-extrabold text-primary">
                {formatMoney(unitPrice)}
              </p>
              {hasOffer && (
                <p className="text-xs text-ink-soft line-through">
                  {formatMoney(product.precio_venta)}
                </p>
              )}
              <p className="mt-1 text-xs text-ink-soft">
                {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setFichaOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 border border-surface-border px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-white"
              >
                <Eye className="h-4 w-4" />
                Ver ficha
              </button>
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => addItem(product)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-ink-soft"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      </article>

      {fichaOpen && (
        <ProductDetailModal
          product={product}
          onClose={() => setFichaOpen(false)}
        />
      )}
    </>
  )
}

import { useEffect } from 'react'
import { Plus, Tag, X } from 'lucide-react'
import useCartStore, { formatMoney, getUnitPrice } from '../store/useCartStore'

function SpecChip({ label, value }) {
  if (!value) return null
  return (
    <div className="border border-surface-border bg-surface-muted px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

export default function ProductDetailModal({ product, onClose }) {
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (!product) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [product, onClose])

  if (!product) return null

  const hasOffer =
    product.precio_oferta != null && product.precio_oferta > 0
  const unitPrice = getUnitPrice(product)
  const outOfStock = product.stock <= 0
  const hasSpecs =
    product.marca_fabricante ||
    product.origen ||
    product.material ||
    product.contenido_caja ||
    product.compatibilidad

  const handleAdd = () => {
    addItem(product)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-fadeIn"
        aria-label="Cerrar ficha técnica"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-titulo"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border border-surface-border bg-surface-raised shadow-panel animate-scaleIn sm:max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Ficha técnica
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-surface-border text-ink-soft transition hover:border-primary hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 overflow-y-auto md:grid-cols-2">
          <div className="relative aspect-[4/3] bg-surface-muted md:aspect-auto md:min-h-[280px]">
            {product.imagen_url ? (
              <img
                src={product.imagen_url}
                alt={product.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-ink-soft">
                Sin imagen
              </div>
            )}
            {hasOffer && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                <Tag className="h-3 w-3" />
                Oferta
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div>
              <h2
                id="ficha-titulo"
                className="font-display text-3xl font-extrabold italic leading-none tracking-wide text-white sm:text-4xl"
              >
                {product.nombre}
              </h2>
              {product.descripcion && (
                <p className="mt-2 text-sm text-ink-soft">{product.descripcion}</p>
              )}
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-display text-3xl font-extrabold text-primary">
                  {formatMoney(unitPrice)}
                </p>
                {hasOffer && (
                  <p className="text-sm text-ink-soft line-through">
                    {formatMoney(product.precio_venta)}
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
              </p>
            </div>

            {hasSpecs ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <SpecChip label="Marca fabricante" value={product.marca_fabricante} />
                  <SpecChip label="Origen" value={product.origen} />
                  <SpecChip label="Material" value={product.material} />
                  <SpecChip label="Contenido caja" value={product.contenido_caja} />
                </div>

                {product.compatibilidad && (
                  <div className="border border-primary/40 bg-primary/10 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                      Compatibilidad de vehículos
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white">
                      {product.compatibilidad}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="border border-dashed border-surface-border px-3 py-4 text-sm text-ink-soft">
                Este repuesto aún no tiene ficha técnica registrada.
              </p>
            )}

            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAdd}
              className="mt-auto inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-ink-soft"
            >
              <Plus className="h-4 w-4" />
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

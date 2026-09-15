import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse border border-surface-border bg-surface-raised"
          >
            <div className="aspect-[4/3] bg-surface-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 bg-surface-border" />
              <div className="h-4 w-full bg-surface-muted" />
              <div className="h-8 w-1/2 bg-surface-border" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-primary/40 bg-primary/10 px-5 py-8 text-center text-primary">
        <p className="font-semibold text-white">No se pudieron cargar los productos</p>
        <p className="mt-1 text-sm text-ink-soft">{error}</p>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="border border-dashed border-surface-border bg-surface-raised/60 px-5 py-14 text-center">
        <p className="font-display text-2xl font-bold italic tracking-wide text-white">
          Sin resultados
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Prueba otra categoría o ajusta el término de búsqueda.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

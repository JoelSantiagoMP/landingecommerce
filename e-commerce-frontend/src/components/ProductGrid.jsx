import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse border border-slate-200 bg-white"
          >
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 bg-slate-200" />
              <div className="h-4 w-full bg-slate-100" />
              <div className="h-8 w-1/2 bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 px-5 py-8 text-center text-red-700">
        <p className="font-semibold">No se pudieron cargar los productos</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="border border-dashed border-slate-300 bg-white/70 px-5 py-14 text-center">
        <p className="font-display text-2xl font-bold tracking-wide text-ink">
          Sin resultados
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Prueba otra categoría o ajusta el término de búsqueda.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

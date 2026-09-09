import { Menu, Search, ShoppingCart, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import useCartStore from '../store/useCartStore'

export default function Navbar({
  categorias = [],
  categoriaActiva,
  onSelectCategoria,
  search,
  onSearchChange,
}) {
  const openCart = useCartStore((s) => s.openCart)
  const totalItems = useCartStore((s) => s.getTotalItems())
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#catalogo" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center bg-primary text-white transition group-hover:bg-primary-hover">
            <Wrench className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-2xl font-extrabold tracking-wide text-ink">
              TORQUE
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Repuestos
            </span>
          </span>
        </a>

        <div className="relative mx-auto hidden w-full max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o referencia…"
            className="w-full border border-slate-200 bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Buscar productos"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-slate-200 text-ink md:hidden"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 items-center gap-2 bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-amber-400 px-1 text-[11px] font-bold text-ink">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onSelectCategoria(null)}
            className={`shrink-0 px-3 py-1.5 text-sm font-semibold transition ${
              categoriaActiva == null
                ? 'bg-primary text-white'
                : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategoria(cat.id)}
              className={`shrink-0 px-3 py-1.5 text-sm font-semibold transition ${
                categoriaActiva === cat.id
                  ? 'bg-primary text-white'
                  : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar repuestos…"
              className="w-full border border-slate-200 bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </header>
  )
}

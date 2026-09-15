import { Menu, Search, ShoppingCart, X } from 'lucide-react'
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
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <a href="#catalogo" className="group flex min-w-0 shrink-0 items-center gap-2.5">
          <img
            src="/brand-casa-wod.jpg"
            alt="CASA WOD"
            className="h-10 w-10 object-cover object-center ring-1 ring-surface-border sm:h-11 sm:w-11"
          />
          <span className="leading-none">
            <span className="block font-display text-xl font-extrabold italic tracking-wide text-white sm:text-2xl">
              CASA <span className="text-primary">WOD</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:block sm:text-[11px] sm:tracking-[0.16em]">
              Repuestos & Autopartes
            </span>
          </span>
        </a>

        <div className="relative mx-auto hidden w-full max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, marca o compatibilidad…"
            className="w-full border border-surface-border bg-surface-raised py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/25"
            aria-label="Buscar productos"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-surface-border text-ink-soft transition hover:border-primary hover:text-white md:hidden"
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
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-white px-1 text-[11px] font-bold text-primary">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="border-t border-surface-border bg-surface-raised/80">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onSelectCategoria(null)}
            className={`shrink-0 px-3 py-1.5 text-sm font-semibold transition ${
              categoriaActiva == null
                ? 'bg-primary text-white'
                : 'text-ink-soft hover:bg-surface-muted hover:text-white'
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
                  : 'text-ink-soft hover:bg-surface-muted hover:text-white'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-surface-border bg-surface-raised px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar repuestos…"
              className="w-full border border-surface-border bg-surface py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-ink-soft focus:border-primary"
            />
          </div>
        </div>
      )}
    </header>
  )
}

import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategorias, getProductos } from '../api/client'
import CartDrawer from '../components/CartDrawer'
import CheckoutModal from '../components/CheckoutModal'
import Navbar from '../components/Navbar'
import ProductGrid from '../components/ProductGrid'

export default function HomePage() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [catsRes, prodsRes] = await Promise.all([
          getCategorias(),
          getProductos({ activo: true, limit: 100 }),
        ])
        if (cancelled) return
        setCategorias(catsRes.data ?? [])
        setProductos(prodsRes.data ?? [])
      } catch (err) {
        if (cancelled) return
        const isNetwork =
          err?.code === 'ERR_NETWORK' ||
          err?.message?.toLowerCase?.().includes('network')
        setError(
          isNetwork
            ? 'No hay conexión con la API. En Vercel debes configurar VITE_API_URL con la URL de Render (…/api/v1) y volver a desplegar.'
            : 'Error al cargar el catálogo.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const productosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    return productos.filter((p) => {
      const matchCat =
        categoriaActiva == null || p.categoria_id === categoriaActiva
      const matchSearch =
        !q ||
        p.nombre?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.marca_fabricante?.toLowerCase().includes(q) ||
        p.compatibilidad?.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [productos, categoriaActiva, search])

  const categoriaNombre =
    categorias.find((c) => c.id === categoriaActiva)?.nombre ?? 'Todos los repuestos'

  return (
    <div className="min-h-screen">
      <Navbar
        categorias={categorias}
        categoriaActiva={categoriaActiva}
        onSelectCategoria={setCategoriaActiva}
        search={search}
        onSearchChange={setSearch}
      />

      <section className="relative min-h-[78vh] overflow-hidden bg-black text-white">
        <img
          src="/brand-casa-wod.jpg"
          alt="CASA WOD — Repuestos y autopartes"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16 lg:px-8">
          <p className="font-display text-5xl font-extrabold italic leading-none tracking-[0.04em] sm:text-7xl lg:text-8xl">
            CASA <span className="text-primary">WOD</span>
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-ink-soft sm:text-base">
            Repuestos & Autopartes
          </p>
          <h1 className="mt-5 max-w-lg font-display text-2xl font-bold leading-tight tracking-wide text-white sm:text-4xl">
            Calidad que mueve tu motor
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink-soft sm:text-base">
            Bobinas, sensores y combustible con ficha técnica clara: marca, origen y
            compatibilidad de vehículos.
          </p>
          <a
            href="#catalogo"
            className="mt-8 inline-flex w-fit items-center gap-2 bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover"
          >
            Ver catálogo
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <main id="catalogo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold italic tracking-wide text-white sm:text-4xl">
              {categoriaNombre}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {loading
                ? 'Cargando inventario…'
                : `${productosFiltrados.length} producto(s) disponibles`}
            </p>
          </div>
        </div>

        <ProductGrid
          products={productosFiltrados}
          loading={loading}
          error={error}
        />
      </main>

      <footer className="border-t border-surface-border bg-surface-raised/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-display text-lg font-bold italic tracking-wide text-white">
            CASA <span className="text-primary">WOD</span>
            <span className="ml-2 text-xs font-sans font-semibold uppercase tracking-wider text-ink-soft">
              Repuestos & Autopartes
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <span>Venta directa · Envíos a todo el país</span>
            <Link to="/admin" className="font-semibold text-primary hover:text-primary-hover">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <CheckoutModal />
    </div>
  )
}

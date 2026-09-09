import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategorias, getProductos } from '../api/client'
import CartDrawer from '../components/CartDrawer'
import CheckoutModal from '../components/CheckoutModal'
import Navbar from '../components/Navbar'
import ProductGrid from '../components/ProductGrid'

export default function App() {
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
        setError(
          err?.message?.includes('Network')
            ? 'No hay conexión con la API. ¿Está corriendo en :8000?'
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
        p.descripcion?.toLowerCase().includes(q)
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

      <section className="relative min-h-[72vh] overflow-hidden bg-surface-dark text-white">
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=80"
          alt="Taller mecánico con repuestos y herramientas"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/35" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <p className="font-display text-5xl font-extrabold tracking-[0.08em] sm:text-7xl">
            TORQUE
          </p>
          <h1 className="mt-3 max-w-xl font-display text-3xl font-bold leading-none tracking-wide sm:text-5xl">
            Repuestos listos para despacho
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-200 sm:text-lg">
            Catálogo directo al taller: filtra por categoría, agrega al carrito y
            confirma tu pedido en minutos.
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
            <h2 className="font-display text-3xl font-bold tracking-wide text-ink sm:text-4xl">
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

      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-display text-lg font-bold tracking-wide text-ink">
            TORQUE Repuestos
          </span>
          <div className="flex items-center gap-4">
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

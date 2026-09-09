import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createProducto,
  getCategorias,
  getOrdenes,
  getProductos,
  updateOrdenEstado,
  updateProducto,
} from '../api/client'
import useAuthStore from '../store/useAuthStore'
import { formatMoney } from '../store/useCartStore'

const ESTADOS_ORDEN = ['PENDIENTE', 'PAGADO', 'ENVIADO']

const emptyProductForm = {
  nombre: '',
  descripcion: '',
  precio_venta: '',
  precio_oferta: '',
  stock: '10',
  imagen_url: '',
  activo: true,
  categoria_id: '',
}

function estadoBadgeClass(estado) {
  switch (estado) {
    case 'PAGADO':
      return 'bg-emerald-100 text-emerald-800'
    case 'ENVIADO':
      return 'bg-sky-100 text-sky-800'
    case 'CANCELADO':
      return 'bg-slate-200 text-slate-600'
    default:
      return 'bg-amber-100 text-amber-900'
  }
}

function ProductFormModal({ open, initial, categorias, onClose, onSaved }) {
  const [form, setForm] = useState(emptyProductForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        nombre: initial.nombre ?? '',
        descripcion: initial.descripcion ?? '',
        precio_venta: String(initial.precio_venta ?? ''),
        precio_oferta:
          initial.precio_oferta != null ? String(initial.precio_oferta) : '',
        stock: String(initial.stock ?? 0),
        imagen_url: initial.imagen_url ?? '',
        activo: Boolean(initial.activo),
        categoria_id: String(initial.categoria_id ?? ''),
      })
    } else {
      setForm({
        ...emptyProductForm,
        categoria_id: categorias[0] ? String(categorias[0].id) : '',
      })
    }
    setError('')
  }, [open, initial, categorias])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio_venta: Number(form.precio_venta),
      precio_oferta: form.precio_oferta
        ? Number(form.precio_oferta)
        : null,
      stock: Number(form.stock),
      imagen_url: form.imagen_url.trim(),
      activo: form.activo,
      categoria_id: Number(form.categoria_id),
    }

    try {
      if (initial?.id) {
        await updateProducto(initial.id, payload)
      } else {
        await createProducto(payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'No se pudo guardar el producto. Revisa los datos.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-slate-200 bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-2xl font-bold tracking-wide">
            {initial ? 'Editar repuesto' : 'Nuevo repuesto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-slate-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-5">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Nombre</span>
            <input
              required
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Descripción</span>
            <textarea
              name="descripcion"
              rows={2}
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Categoría</span>
            <select
              required
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Precio venta</span>
              <input
                required
                type="number"
                min="1"
                step="1"
                name="precio_venta"
                value={form.precio_venta}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Precio oferta</span>
              <input
                type="number"
                min="1"
                step="1"
                name="precio_oferta"
                value={form.precio_oferta}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Stock</span>
              <input
                required
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="h-4 w-4 accent-primary"
              />
              Activo en tienda
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">URL imagen</span>
            <input
              name="imagen_url"
              value={form.imagen_url}
              onChange={handleChange}
              placeholder="https://…"
              className="w-full border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:bg-slate-300"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.loading)
  const authError = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const hydrateUser = useAuthStore((s) => s.hydrateUser)

  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('admin@torque.com')
  const [password, setPassword] = useState('')

  const [tab, setTab] = useState('productos')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [updatingUuid, setUpdatingUuid] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await hydrateUser()
      if (!cancelled) setAuthReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [hydrateUser])

  const categoriaMap = useMemo(() => {
    const map = {}
    categorias.forEach((c) => {
      map[c.id] = c.nombre
    })
    return map
  }, [categorias])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [cats, prods, ords] = await Promise.all([
        getCategorias(),
        getProductos({ limit: 100 }),
        getOrdenes({ limit: 100 }),
      ])
      setCategorias(cats.data ?? [])
      setProductos(prods.data ?? [])
      setOrdenes(ords.data ?? [])
    } catch (err) {
      if (err?.response?.status === 401) {
        logout()
        setError('Sesión expirada. Inicia sesión de nuevo.')
      } else {
        setError('No se pudo cargar el panel. ¿La API está en :8000?')
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (token && user) {
      loadData()
    }
  }, [token, user, loadData])

  const handleLogin = async (e) => {
    e.preventDefault()
    await login(email.trim(), password)
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="font-display text-3xl font-extrabold tracking-wide">TORQUE</p>
            <h1 className="mt-1 font-display text-xl font-bold">Acceso administrador</h1>
            <p className="mt-1 text-sm text-ink-soft">Inicia sesión con tu cuenta JWT</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 px-6 py-5">
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Contraseña</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            {authError && (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:bg-slate-300"
            >
              {authLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Entrar
            </button>
            <Link
              to="/"
              className="block text-center text-sm font-semibold text-ink-soft hover:text-primary"
            >
              Volver a la tienda
            </Link>
          </form>
        </div>
      </div>
    )
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setFormOpen(true)
  }

  const handleEstadoChange = async (uuid, estado) => {
    setUpdatingUuid(uuid)
    try {
      const { data } = await updateOrdenEstado(uuid, estado)
      setOrdenes((prev) =>
        prev.map((o) => (o.uuid === uuid ? { ...o, ...data } : o)),
      )
    } catch {
      setError('No se pudo actualizar el estado de la orden.')
    } finally {
      setUpdatingUuid(null)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Tienda
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-extrabold tracking-wide text-ink sm:text-3xl">
              Panel Admin
            </p>
            <p className="text-sm text-ink-soft">
              {user.nombre} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-surface"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('productos')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wide ${
              tab === 'productos'
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-ink-soft hover:text-ink'
            }`}
          >
            <Package className="h-4 w-4" />
            Productos
          </button>
          <button
            type="button"
            onClick={() => setTab('ordenes')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wide ${
              tab === 'ordenes'
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-ink-soft hover:text-ink'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Órdenes
          </button>
        </div>

        {error && (
          <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {tab === 'productos' && (
          <section className="border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-wide">
                  Gestión de productos
                </h2>
                <p className="text-sm text-ink-soft">
                  {loading ? 'Cargando…' : `${productos.length} repuesto(s)`}
                </p>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" />
                Nuevo repuesto
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">Precio venta</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      </td>
                    </tr>
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                        No hay productos. Crea el primero.
                      </td>
                    </tr>
                  ) : (
                    productos.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-surface/60">
                        <td className="px-4 py-3 font-semibold text-ink">{p.nombre}</td>
                        <td className="px-4 py-3 text-ink-soft">
                          {categoriaMap[p.categoria_id] ?? '—'}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatMoney(p.precio_venta)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              p.stock <= 3 ? 'font-bold text-amber-700' : ''
                            }
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-bold ${
                              p.activo
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 border border-slate-200 px-2 py-1.5 text-xs font-semibold hover:bg-surface"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'ordenes' && (
          <section className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-display text-xl font-bold tracking-wide">
                Pedidos generados
              </h2>
              <p className="text-sm text-ink-soft">
                {loading ? 'Cargando…' : `${ordenes.length} orden(es)`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 font-semibold">UUID</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Cambiar estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      </td>
                    </tr>
                  ) : ordenes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                        Aún no hay pedidos.
                      </td>
                    </tr>
                  ) : (
                    ordenes.map((o) => (
                      <tr key={o.uuid} className="border-t border-slate-100 hover:bg-surface/60">
                        <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-ink-soft" title={o.uuid}>
                          {o.uuid}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{o.cliente_nombre}</p>
                          <p className="text-xs text-ink-soft">{o.cliente_email}</p>
                        </td>
                        <td className="px-4 py-3">{o.cliente_telefono}</td>
                        <td className="px-4 py-3 font-bold">{formatMoney(o.total)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-bold ${estadoBadgeClass(o.estado)}`}
                          >
                            {o.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {ESTADOS_ORDEN.filter((e) => e !== o.estado).map((estado) => (
                              <button
                                key={estado}
                                type="button"
                                disabled={updatingUuid === o.uuid}
                                onClick={() => handleEstadoChange(o.uuid, estado)}
                                className="inline-flex items-center gap-1 border border-slate-200 px-2 py-1 text-[11px] font-bold uppercase tracking-wide hover:bg-surface disabled:opacity-50"
                              >
                                {estado === 'PAGADO' && (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                )}
                                {estado === 'ENVIADO' && (
                                  <Truck className="h-3 w-3 text-sky-600" />
                                )}
                                {estado}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <ProductFormModal
        open={formOpen}
        initial={editing}
        categorias={categorias}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
      />
    </div>
  )
}

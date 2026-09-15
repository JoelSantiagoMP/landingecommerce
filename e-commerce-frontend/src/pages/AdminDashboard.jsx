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
  marca_fabricante: '',
  origen: '',
  material: '',
  contenido_caja: '',
  compatibilidad: '',
}

const inputClass =
  'w-full border border-surface-border bg-surface px-3 py-2 text-sm text-white outline-none placeholder:text-ink-soft focus:border-primary'

function estadoBadgeClass(estado) {
  switch (estado) {
    case 'PAGADO':
      return 'bg-emerald-500/20 text-emerald-300'
    case 'ENVIADO':
      return 'bg-sky-500/20 text-sky-300'
    case 'CANCELADO':
      return 'bg-surface-border text-ink-soft'
    default:
      return 'bg-amber-500/20 text-amber-300'
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
        marca_fabricante: initial.marca_fabricante ?? '',
        origen: initial.origen ?? '',
        material: initial.material ?? '',
        contenido_caja: initial.contenido_caja ?? '',
        compatibilidad: initial.compatibilidad ?? '',
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
      precio_oferta: form.precio_oferta ? Number(form.precio_oferta) : null,
      stock: Number(form.stock),
      imagen_url: form.imagen_url.trim(),
      activo: form.activo,
      categoria_id: Number(form.categoria_id),
      marca_fabricante: form.marca_fabricante.trim() || null,
      origen: form.origen.trim() || null,
      material: form.material.trim() || null,
      contenido_caja: form.contenido_caja.trim() || null,
      compatibilidad: form.compatibilidad.trim() || null,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto border border-surface-border bg-surface-raised shadow-panel">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="font-display text-2xl font-bold italic tracking-wide text-white">
            {initial ? 'Editar repuesto' : 'Nuevo repuesto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-surface-border text-ink-soft hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-5">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-white">Nombre</span>
            <input
              required
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-white">Descripción</span>
            <textarea
              name="descripcion"
              rows={2}
              value={form.descripcion}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-white">Categoría</span>
            <select
              required
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              className={inputClass}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-white">Precio venta</span>
              <input
                required
                type="number"
                min="1"
                step="1"
                name="precio_venta"
                value={form.precio_venta}
                onChange={handleChange}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-white">Precio oferta</span>
              <input
                type="number"
                min="1"
                step="1"
                name="precio_oferta"
                value={form.precio_oferta}
                onChange={handleChange}
                placeholder="Opcional"
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-white">Stock</span>
              <input
                required
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className={inputClass}
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-white">
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
            <span className="text-sm font-semibold text-white">URL imagen</span>
            <input
              name="imagen_url"
              value={form.imagen_url}
              onChange={handleChange}
              placeholder="https://…"
              className={inputClass}
            />
          </label>

          <div className="border-t border-surface-border pt-3">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Ficha técnica
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-white">Marca fabricante</span>
                <input
                  name="marca_fabricante"
                  value={form.marca_fabricante}
                  onChange={handleChange}
                  placeholder="Bosch, Beru…"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-white">Origen</span>
                <input
                  name="origen"
                  value={form.origen}
                  onChange={handleChange}
                  placeholder="Alemania…"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-white">Material</span>
                <input
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-white">Contenido caja</span>
                <input
                  name="contenido_caja"
                  value={form.contenido_caja}
                  onChange={handleChange}
                  placeholder="1 unidad"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="mt-3 block space-y-1">
              <span className="text-sm font-semibold text-white">Compatibilidad</span>
              <textarea
                name="compatibilidad"
                rows={2}
                value={form.compatibilidad}
                onChange={handleChange}
                placeholder="Opel Corsa B, Astra F/G…"
                className={inputClass}
              />
            </label>
          </div>

          {error && (
            <p className="border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:bg-surface-border disabled:text-ink-soft"
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
        <div className="w-full max-w-md border border-surface-border bg-surface-raised shadow-panel">
          <div className="border-b border-surface-border px-6 py-5">
            <p className="font-display text-3xl font-extrabold italic tracking-wide text-white">
              CASA <span className="text-primary">WOD</span>
            </p>
            <h1 className="mt-1 font-display text-xl font-bold text-white">
              Acceso administrador
            </h1>
            <p className="mt-1 text-sm text-ink-soft">Inicia sesión con tu cuenta JWT</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 px-6 py-5">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-white">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-white">Contraseña</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            {authError && (
              <p className="border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:bg-surface-border"
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
      <header className="border-b border-surface-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Tienda
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-extrabold italic tracking-wide text-white sm:text-3xl">
              Panel Admin
            </p>
            <p className="text-sm text-ink-soft">
              {user.nombre} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 border border-surface-border bg-surface-raised px-3 py-2 text-sm font-semibold text-white hover:border-primary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 border border-surface-border bg-surface-raised px-3 py-2 text-sm font-semibold text-ink-soft hover:text-white"
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
                : 'border border-surface-border bg-surface-raised text-ink-soft hover:text-white'
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
                : 'border border-surface-border bg-surface-raised text-ink-soft hover:text-white'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Órdenes
          </button>
        </div>

        {error && (
          <p className="mb-4 border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        {tab === 'productos' && (
          <section className="border border-surface-border bg-surface-raised">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
              <div>
                <h2 className="font-display text-xl font-bold italic tracking-wide text-white">
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
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Marca</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">Precio</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      </td>
                    </tr>
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                        No hay productos. Crea el primero.
                      </td>
                    </tr>
                  ) : (
                    productos.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-surface-border hover:bg-surface/60"
                      >
                        <td className="px-4 py-3 font-semibold text-white">{p.nombre}</td>
                        <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">
                          {p.marca_fabricante || '—'}
                        </td>
                        <td className="px-4 py-3 text-ink-soft">
                          {categoriaMap[p.categoria_id] ?? '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {formatMoney(p.precio_venta)}
                        </td>
                        <td className="px-4 py-3 text-white">
                          <span className={p.stock <= 3 ? 'font-bold text-amber-400' : ''}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-bold ${
                              p.activo
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-surface-border text-ink-soft'
                            }`}
                          >
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 border border-surface-border px-2 py-1.5 text-xs font-semibold text-ink-soft hover:border-primary hover:text-white"
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
          <section className="border border-surface-border bg-surface-raised">
            <div className="border-b border-surface-border px-4 py-3">
              <h2 className="font-display text-xl font-bold italic tracking-wide text-white">
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
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">Teléfono</th>
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
                      <tr
                        key={o.uuid}
                        className="border-t border-surface-border hover:bg-surface/60"
                      >
                        <td
                          className="max-w-[100px] truncate px-4 py-3 font-mono text-xs text-ink-soft sm:max-w-[140px]"
                          title={o.uuid}
                        >
                          {o.uuid}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{o.cliente_nombre}</p>
                          <p className="text-xs text-ink-soft">{o.cliente_email}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-white md:table-cell">
                          {o.cliente_telefono}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          {formatMoney(o.total)}
                        </td>
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
                                className="inline-flex items-center gap-1 border border-surface-border px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft hover:border-primary hover:text-white disabled:opacity-50"
                              >
                                {estado === 'PAGADO' && (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                )}
                                {estado === 'ENVIADO' && (
                                  <Truck className="h-3 w-3 text-sky-400" />
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

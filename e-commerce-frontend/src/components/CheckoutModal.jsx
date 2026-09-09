import { CheckCircle2, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { createCheckout } from '../api/client'
import useCartStore, { formatMoney } from '../store/useCartStore'

const initialForm = {
  cliente_nombre: '',
  cliente_email: '',
  cliente_telefono: '',
}

export default function CheckoutModal() {
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen)
  const closeCheckout = useCartStore((s) => s.closeCheckout)
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartStore((s) => s.getTotal())

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderUuid, setOrderUuid] = useState(null)

  if (!isCheckoutOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setError('')
    setSubmitting(false)
    if (orderUuid) {
      setOrderUuid(null)
      setForm(initialForm)
    }
    closeCheckout()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        cliente_nombre: form.cliente_nombre.trim(),
        cliente_email: form.cliente_email.trim(),
        cliente_telefono: form.cliente_telefono.trim(),
        items: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.quantity,
        })),
      }

      const { data } = await createCheckout(payload)
      clearCart()
      setOrderUuid(data.uuid)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'No se pudo completar el pedido. Verifica los datos e inténtalo de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Cerrar checkout"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg border border-slate-200 bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="font-display text-2xl font-bold tracking-wide">
              {orderUuid ? 'Pedido confirmado' : 'Finalizar compra'}
            </p>
            {!orderUuid && (
              <p className="text-sm text-ink-soft">Total: {formatMoney(total)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-ink-soft hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {orderUuid ? (
          <div className="space-y-4 px-5 py-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <p className="text-balance text-ink-soft">
              Recibimos tu pedido. Guarda este código para seguimiento:
            </p>
            <p className="break-all bg-surface px-4 py-3 font-mono text-sm font-semibold text-primary">
              {orderUuid}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-ink">Nombre completo</span>
              <input
                required
                name="cliente_nombre"
                value={form.cliente_nombre}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ej. Carlos Méndez"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-ink">Correo electrónico</span>
              <input
                required
                type="email"
                name="cliente_email"
                value={form.cliente_email}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="tu@correo.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-ink">Teléfono / WhatsApp</span>
              <input
                required
                name="cliente_telefono"
                value={form.cliente_telefono}
                onChange={handleChange}
                minLength={5}
                className="w-full border border-slate-200 bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="+57 300 123 4567"
              />
            </label>

            {error && (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                'Confirmar pedido'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

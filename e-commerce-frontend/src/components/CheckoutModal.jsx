import { CheckCircle2, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { crearTransaccionWompi } from '../api/client'
import useCartStore, { formatMoney } from '../store/useCartStore'

const initialForm = {
  cliente_nombre: '',
  cliente_email: '',
  cliente_telefono: '',
}

function getWidgetCheckout() {
  if (typeof window === 'undefined') return null
  return window.WidgetCheckout ?? null
}

export default function CheckoutModal() {
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen)
  const closeCheckout = useCartStore((s) => s.closeCheckout)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartStore((s) => s.getTotal())

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  if (!isCheckoutOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setError('')
    setSubmitting(false)
    if (success) {
      setSuccess(null)
      setForm(initialForm)
    }
    closeCheckout()
  }

  const handlePaymentResult = (result, ordenUuid) => {
    const transaction = result?.transaction
    const status = String(transaction?.status || '').toUpperCase()

    if (status === 'APPROVED') {
      clearCart()
      closeCart()
      setSuccess({
        ordenUuid,
        transactionId: transaction?.id || null,
        reference: transaction?.reference || null,
      })
      return
    }

    if (status === 'PENDING' || status === 'PENDING_VALIDATION') {
      setError(
        'Tu pago quedó pendiente de confirmación. Te avisaremos cuando Wompi lo apruebe. No vuelvas a pagar con la misma referencia.',
      )
      return
    }

    setError(
      status
        ? `Pago ${status.toLowerCase()}. Puedes intentar de nuevo con otro medio de pago.`
        : 'No se pudo completar el pago. Inténtalo de nuevo.',
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const WidgetCheckout = getWidgetCheckout()
    if (!WidgetCheckout) {
      setSubmitting(false)
      setError(
        'El widget de Wompi no está disponible. Recarga la página e inténtalo de nuevo.',
      )
      return
    }

    const email = form.cliente_email.trim()
    const fullName = form.cliente_nombre.trim()
    const phoneRaw = form.cliente_telefono.trim()
    const phoneDigits = phoneRaw.replace(/\D/g, '').replace(/^57/, '')

    try {
      const cartItems = items.map((item) => ({
        producto_id: item.id,
        cantidad: item.quantity,
      }))

      const { data } = await crearTransaccionWompi(cartItems)

      const checkout = new WidgetCheckout({
        currency: data.moneda,
        amountInCents: data.monto_en_centavos,
        reference: data.referencia,
        publicKey: data.public_key,
        signature: { integrity: data.firma_integridad },
        customerData: {
          email,
          fullName,
          ...(phoneDigits
            ? { phoneNumber: phoneDigits, phoneNumberPrefix: '+57' }
            : {}),
        },
      })

      setSubmitting(false)

      checkout.open((result) => {
        handlePaymentResult(result, data.orden_uuid)
      })
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'No se pudo iniciar el pago. Verifica los datos e inténtalo de nuevo.',
      )
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-surface-border bg-surface px-3 py-2.5 text-sm text-white outline-none placeholder:text-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/25'

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-fadeIn"
        aria-label="Cerrar checkout"
        onClick={handleClose}
        disabled={submitting}
      />

      <div className="relative w-full max-w-lg border border-surface-border bg-surface-raised shadow-panel animate-scaleIn">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <div>
            <p className="font-display text-2xl font-bold italic tracking-wide text-white">
              {success ? 'Pago aprobado' : 'Finalizar compra'}
            </p>
            {!success && (
              <p className="text-sm text-ink-soft">Total: {formatMoney(total)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="inline-flex h-9 w-9 items-center justify-center border border-surface-border text-ink-soft transition hover:border-primary hover:text-white disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 px-5 py-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <p className="text-balance text-ink-soft">
              Pago recibido. Guarda este código de orden para seguimiento:
            </p>
            <p className="break-all border border-surface-border bg-surface px-4 py-3 font-mono text-sm font-semibold text-primary">
              {success.ordenUuid}
            </p>
            {success.transactionId && (
              <p className="text-xs text-ink-soft">
                Transacción Wompi:{' '}
                <span className="font-mono text-white">{success.transactionId}</span>
              </p>
            )}
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
              <span className="text-sm font-semibold text-white">Nombre completo</span>
              <input
                required
                name="cliente_nombre"
                value={form.cliente_nombre}
                onChange={handleChange}
                disabled={submitting}
                className={inputClass}
                placeholder="Ej. Carlos Méndez"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-white">Correo electrónico</span>
              <input
                required
                type="email"
                name="cliente_email"
                value={form.cliente_email}
                onChange={handleChange}
                disabled={submitting}
                className={inputClass}
                placeholder="tu@correo.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-white">Teléfono / WhatsApp</span>
              <input
                required
                name="cliente_telefono"
                value={form.cliente_telefono}
                onChange={handleChange}
                disabled={submitting}
                minLength={5}
                className={inputClass}
                placeholder="+57 300 123 4567"
              />
            </label>

            {error && (
              <p className="border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-ink-soft"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparando pago…
                </>
              ) : (
                'Proceder al pago'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

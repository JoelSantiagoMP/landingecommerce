from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.orden import Orden, OrdenItem
from app.models.producto import Producto
from app.schemas.pago import (
    CheckoutItemRequest,
    CrearTransaccionResponse,
    WebhookAckResponse,
)
from app.services.wompi import (
    centavos_a_cop,
    cop_a_centavos,
    firma_integridad_transaccion,
    generar_referencia,
    validar_firma_evento,
)

router = APIRouter(prefix="/pagos", tags=["pagos"])

_MAX_REFERENCIA_INTENTOS = 8


def _precio_unitario(producto: Producto) -> float:
    if producto.precio_oferta is not None:
        return float(producto.precio_oferta)
    return float(producto.precio_venta)


def _nueva_referencia_unica(db: Session) -> str:
    for _ in range(_MAX_REFERENCIA_INTENTOS):
        referencia = generar_referencia()
        existe = (
            db.query(Orden.id).filter(Orden.referencia == referencia).first() is not None
        )
        if not existe:
            return referencia
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="No se pudo generar una referencia de pago única",
    )


@router.post(
    "/crear-transaccion",
    response_model=CrearTransaccionResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_transaccion(
    items: List[CheckoutItemRequest],
    db: Session = Depends(get_db),
) -> CrearTransaccionResponse:
    """
    Calcula el total desde precios reales en BD, crea la orden PENDIENTE
    y retorna la firma de integridad para el Widget Wompi.

    Body: ``[{ "producto_id": 1, "cantidad": 2 }, ...]``
    """
    if not settings.WOMPI_INTEGRITY_SECRET or not settings.WOMPI_PUBLIC_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Integración Wompi no configurada (faltan llaves/secretos)",
        )

    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La transacción debe incluir al menos un producto",
        )

    # Agrupa cantidades por producto para evitar líneas duplicadas.
    cantidades: dict[int, int] = {}
    for item in items:
        cantidades[item.producto_id] = cantidades.get(item.producto_id, 0) + item.cantidad

    producto_ids = list(cantidades.keys())
    productos = (
        db.query(Producto)
        .filter(Producto.id.in_(producto_ids), Producto.activo.is_(True))
        .with_for_update()
        .all()
    )
    por_id = {p.id: p for p in productos}

    if len(por_id) != len(producto_ids):
        faltantes = sorted(set(producto_ids) - set(por_id.keys()))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Productos no disponibles: {faltantes}",
        )

    monto_en_centavos = 0
    lineas: list[tuple[Producto, int, int]] = []

    for producto_id, cantidad in cantidades.items():
        producto = por_id[producto_id]
        if producto.stock < cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Stock insuficiente para '{producto.nombre}' "
                    f"(disponible: {producto.stock})"
                ),
            )

        unit_cents = cop_a_centavos(_precio_unitario(producto))
        if unit_cents <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Precio inválido para '{producto.nombre}'",
            )

        monto_en_centavos += unit_cents * cantidad
        lineas.append((producto, cantidad, unit_cents))

    if monto_en_centavos <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El monto de la transacción debe ser mayor a cero",
        )

    referencia = _nueva_referencia_unica(db)
    orden = Orden(
        referencia=referencia,
        cliente_nombre="Checkout Wompi",
        cliente_email="checkout@pendiente.local",
        cliente_telefono="0000000000",
        total=centavos_a_cop(monto_en_centavos),
        estado="PENDIENTE",
    )
    db.add(orden)
    db.flush()

    for producto, cantidad, unit_cents in lineas:
        db.add(
            OrdenItem(
                orden_id=orden.id,
                producto_id=producto.id,
                cantidad=cantidad,
                precio_unitario=centavos_a_cop(unit_cents),
            )
        )

    # El stock se descuenta solo cuando el webhook confirme APPROVED.
    firma = firma_integridad_transaccion(
        referencia=referencia,
        monto_en_centavos=monto_en_centavos,
        moneda="COP",
        integrity_secret=settings.WOMPI_INTEGRITY_SECRET,
    )

    db.commit()
    db.refresh(orden)

    return CrearTransaccionResponse(
        referencia=referencia,
        monto_en_centavos=monto_en_centavos,
        moneda="COP",
        firma_integridad=firma,
        public_key=settings.WOMPI_PUBLIC_KEY,
        orden_uuid=orden.uuid,
    )


@router.post("/webhook", response_model=WebhookAckResponse)
async def wompi_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_event_checksum: str | None = Header(default=None, alias="X-Event-Checksum"),
) -> WebhookAckResponse:
    """
    Recibe notificaciones de Wompi. Valida la firma del evento y, si la
    transacción está APPROVED, marca la orden como PAGADO y descuenta stock.
    """
    if not settings.WOMPI_EVENTS_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WOMPI_EVENTS_SECRET no configurado",
        )

    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuerpo JSON inválido",
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload de evento inválido",
        )

    if not validar_firma_evento(
        payload=payload,
        events_secret=settings.WOMPI_EVENTS_SECRET,
        checksum_header=x_event_checksum,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma de evento Wompi inválida",
        )

    data = payload.get("data") or {}
    transaction = data.get("transaction") if isinstance(data, dict) else None
    if not isinstance(transaction, dict):
        return WebhookAckResponse(status="ignored")

    referencia = transaction.get("reference")
    tx_status = str(transaction.get("status") or "").upper()
    amount_in_cents = transaction.get("amount_in_cents")

    if not referencia:
        return WebhookAckResponse(status="ignored")

    orden = (
        db.query(Orden)
        .filter(Orden.referencia == str(referencia))
        .with_for_update()
        .first()
    )
    if not orden:
        # 200 para evitar reintentos infinitos por referencias desconocidas.
        return WebhookAckResponse(status="orden_no_encontrada")

    esperado_centavos = cop_a_centavos(orden.total)
    if amount_in_cents is not None:
        try:
            recibido = int(amount_in_cents)
        except (TypeError, ValueError):
            return WebhookAckResponse(status="monto_invalido")
        if recibido != esperado_centavos:
            # Firma válida pero monto inconsistente: no marcar PAGADO.
            return WebhookAckResponse(status="monto_inconsistente")

    if tx_status == "APPROVED":
        if orden.estado != "PAGADO":
            _descontar_stock(db, orden)
            orden.estado = "PAGADO"
            db.commit()
        return WebhookAckResponse(status="pagado")

    if tx_status in {"DECLINED", "VOIDED", "ERROR"} and orden.estado == "PENDIENTE":
        orden.estado = "CANCELADO"
        db.commit()
        return WebhookAckResponse(status="cancelado")

    return WebhookAckResponse(status="ok")


def _descontar_stock(db: Session, orden: Orden) -> None:
    """Descuenta stock al confirmar el pago (idempotente vía estado PAGADO del caller)."""
    items = db.query(OrdenItem).filter(OrdenItem.orden_id == orden.id).all()
    for item in items:
        producto = (
            db.query(Producto)
            .filter(Producto.id == item.producto_id)
            .with_for_update()
            .first()
        )
        if not producto:
            continue
        # Si el stock no alcanza tras el pago, no bloqueamos el ACK (cliente ya pagó).
        producto.stock = max(0, producto.stock - item.cantidad)

from typing import List

from pydantic import BaseModel, Field


class CheckoutItemRequest(BaseModel):
    """Ítem de checkout: solo IDs y cantidades; el precio se toma de la BD."""

    producto_id: int = Field(..., gt=0)
    cantidad: int = Field(..., gt=0)


class CrearTransaccionResponse(BaseModel):
    """Datos que el frontend necesita para abrir el Widget / Checkout de Wompi."""

    referencia: str
    monto_en_centavos: int
    moneda: str = "COP"
    firma_integridad: str
    public_key: str
    orden_uuid: str


class WebhookAckResponse(BaseModel):
    status: str = "ok"

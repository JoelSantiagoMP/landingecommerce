from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

OrdenEstado = Literal["PENDIENTE", "PAGADO", "ENVIADO", "CANCELADO"]


class OrdenItemCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(..., gt=0)


class OrdenItemRead(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float

    model_config = ConfigDict(from_attributes=True)


class CheckoutCreate(BaseModel):
    cliente_nombre: str = Field(..., min_length=1, max_length=150)
    cliente_email: EmailStr
    cliente_telefono: str = Field(..., min_length=5, max_length=30)
    items: List[OrdenItemCreate] = Field(..., min_length=1)


class OrdenEstadoUpdate(BaseModel):
    estado: OrdenEstado


class OrdenRead(BaseModel):
    id: int
    uuid: str
    referencia: str | None = None
    cliente_nombre: str
    cliente_email: str
    cliente_telefono: str
    total: float
    estado: str
    creado_en: datetime
    items: List[OrdenItemRead] = []

    model_config = ConfigDict(from_attributes=True)

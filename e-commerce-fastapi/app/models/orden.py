import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.producto import Producto


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class Orden(Base):
    __tablename__ = "ordenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        nullable=False,
        default=_generate_uuid,
    )
    referencia: Mapped[str | None] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=True,
    )
    cliente_nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    cliente_email: Mapped[str] = mapped_column(String(200), nullable=False)
    cliente_telefono: Mapped[str] = mapped_column(String(30), nullable=False)
    total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    estado: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDIENTE")
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_utcnow,
    )

    items: Mapped[List["OrdenItem"]] = relationship(
        "OrdenItem",
        back_populates="orden",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Orden id={self.id} uuid={self.uuid!r} estado={self.estado!r}>"


class OrdenItem(Base):
    __tablename__ = "orden_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    orden_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ordenes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    producto_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("productos.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Float, nullable=False)

    orden: Mapped["Orden"] = relationship("Orden", back_populates="items")
    producto: Mapped["Producto"] = relationship("Producto")

    def __repr__(self) -> str:
        return f"<OrdenItem id={self.id} producto_id={self.producto_id} cantidad={self.cantidad}>"

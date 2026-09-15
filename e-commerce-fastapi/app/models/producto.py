from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.categoria import Categoria


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False, default="")
    precio_venta: Mapped[float] = mapped_column(Float, nullable=False)
    precio_oferta: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    imagen_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Ficha técnica (repuestos)
    marca_fabricante: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    origen: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    material: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contenido_caja: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    compatibilidad: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    categoria_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("categorias.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    categoria: Mapped["Categoria"] = relationship("Categoria", back_populates="productos")

    def __repr__(self) -> str:
        return f"<Producto id={self.id} nombre={self.nombre!r}>"

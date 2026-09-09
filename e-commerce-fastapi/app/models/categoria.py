from typing import TYPE_CHECKING, List

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.producto import Producto


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)

    productos: Mapped[List["Producto"]] = relationship(
        "Producto",
        back_populates="categoria",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Categoria id={self.id} slug={self.slug!r}>"

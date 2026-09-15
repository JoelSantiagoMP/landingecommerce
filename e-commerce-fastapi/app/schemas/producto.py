from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    descripcion: str = ""
    precio_venta: float = Field(..., gt=0)
    precio_oferta: Optional[float] = Field(None, gt=0)
    stock: int = Field(0, ge=0)
    imagen_url: str = ""
    activo: bool = True
    categoria_id: int
    # Ficha técnica (repuestos)
    marca_fabricante: Optional[str] = Field(None, max_length=100)
    origen: Optional[str] = Field(None, max_length=100)
    material: Optional[str] = Field(None, max_length=200)
    contenido_caja: Optional[str] = Field(None, max_length=100)
    compatibilidad: Optional[str] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    descripcion: Optional[str] = None
    precio_venta: Optional[float] = Field(None, gt=0)
    precio_oferta: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    imagen_url: Optional[str] = None
    activo: Optional[bool] = None
    categoria_id: Optional[int] = None
    marca_fabricante: Optional[str] = Field(None, max_length=100)
    origen: Optional[str] = Field(None, max_length=100)
    material: Optional[str] = Field(None, max_length=200)
    contenido_caja: Optional[str] = Field(None, max_length=100)
    compatibilidad: Optional[str] = None


class ProductoRead(ProductoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

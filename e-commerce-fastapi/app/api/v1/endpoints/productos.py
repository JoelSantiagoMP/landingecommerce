from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoRead, ProductoUpdate

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    activo: bool | None = Query(None, description="Filtrar por estado activo"),
    categoria_id: int | None = Query(None, description="Filtrar por categoría"),
    db: Session = Depends(get_db),
) -> List[Producto]:
    query = db.query(Producto)
    if activo is not None:
        query = query.filter(Producto.activo == activo)
    if categoria_id is not None:
        query = query.filter(Producto.categoria_id == categoria_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)) -> Producto:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    payload: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
) -> Producto:
    categoria = db.get(Categoria, payload.categoria_id)
    if not categoria:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    producto = Producto(**payload.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    payload: ProductoUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
) -> Producto:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if "categoria_id" in data:
        categoria = db.get(Categoria, data["categoria_id"])
        if not categoria:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")

    for field, value in data.items():
        setattr(producto, field, value)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
) -> None:
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()

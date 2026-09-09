from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.orden import Orden, OrdenItem
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.orden import CheckoutCreate, OrdenEstadoUpdate, OrdenRead

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.get("/", response_model=List[OrdenRead])
def listar_ordenes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    estado: str | None = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
) -> List[Orden]:
    """Lista pedidos para el panel de administración (más recientes primero)."""
    query = db.query(Orden).options(joinedload(Orden.items))
    if estado:
        query = query.filter(Orden.estado == estado.upper())
    return (
        query.order_by(Orden.creado_en.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )



@router.post("/", response_model=OrdenRead, status_code=status.HTTP_201_CREATED)
def crear_orden(payload: CheckoutCreate, db: Session = Depends(get_db)) -> Orden:
    """Crea una orden validando stock y calculando el total desde los precios actuales."""
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La orden debe incluir al menos un producto",
        )

    orden = Orden(
        cliente_nombre=payload.cliente_nombre,
        cliente_email=str(payload.cliente_email),
        cliente_telefono=payload.cliente_telefono,
        total=0.0,
        estado="PENDIENTE",
    )
    db.add(orden)
    db.flush()  # Obtiene orden.id sin commit final

    total = 0.0
    for item in payload.items:
        producto = db.get(Producto, item.producto_id)
        if not producto or not producto.activo:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {item.producto_id} no disponible",
            )
        if producto.stock < item.cantidad:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})",
            )

        precio_unitario = (
            producto.precio_oferta
            if producto.precio_oferta is not None
            else producto.precio_venta
        )
        total += precio_unitario * item.cantidad
        producto.stock -= item.cantidad

        db.add(
            OrdenItem(
                orden_id=orden.id,
                producto_id=producto.id,
                cantidad=item.cantidad,
                precio_unitario=precio_unitario,
            )
        )

    orden.total = round(total, 2)
    db.commit()

    return (
        db.query(Orden)
        .options(joinedload(Orden.items))
        .filter(Orden.id == orden.id)
        .one()
    )


@router.get("/{orden_uuid}", response_model=OrdenRead)
def obtener_orden(orden_uuid: str, db: Session = Depends(get_db)) -> Orden:
    orden = (
        db.query(Orden)
        .options(joinedload(Orden.items))
        .filter(Orden.uuid == orden_uuid)
        .first()
    )
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    return orden


@router.patch("/{orden_uuid}/estado", response_model=OrdenRead)
def actualizar_estado_orden(
    orden_uuid: str,
    payload: OrdenEstadoUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
) -> Orden:
    """Cambia el estado de una orden (PENDIENTE → PAGADO / ENVIADO / CANCELADO)."""
    orden = (
        db.query(Orden)
        .options(joinedload(Orden.items))
        .filter(Orden.uuid == orden_uuid)
        .first()
    )
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")

    orden.estado = payload.estado
    db.commit()
    db.refresh(orden)
    return orden

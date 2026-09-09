"""
Carga inicial de categorías y repuestos automotrices.

Uso (desde e-commerce-fastapi/):
    python -m app.seed
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models import Categoria, Orden, OrdenItem, Producto, Usuario  # noqa: F401

DEFAULT_STOCK = 10
ADMIN_EMAIL = "admin@torque.com"
ADMIN_PASSWORD = "admin123password"
ADMIN_NOMBRE = "Administrador TORQUE"

# Placeholders Unsplash (motor / taller / repuestos) hasta vincular Drive/Supabase
IMG_ENGINE = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80"
IMG_COIL = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80"
IMG_SPARK = "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80"
IMG_SENSOR = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
IMG_ELECTRONICS = "https://images.unsplash.com/photo-1517524008699-0baad5b211d9?auto=format&fit=crop&w=800&q=80"
IMG_WORKSHOP = "https://images.unsplash.com/photo-1625047509165-4bdad6ce1742?auto=format&fit=crop&w=800&q=80"
IMG_PARTS = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"

CATEGORIAS = [
    {"nombre": "Encendido y Bobinas", "slug": "encendido-y-bobinas"},
    {"nombre": "Sensores y Electrónica", "slug": "sensores-y-electronica"},
    {"nombre": "Sistema de Combustible", "slug": "sistema-de-combustible"},
]

PRODUCTOS = [
    # Encendido y Bobinas
    {
        "nombre": "Bobina Beru",
        "descripcion": "Bobina de encendido Beru. Compatible con múltiples referencias automotrices.",
        "precio_venta": 65_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_COIL,
    },
    {
        "nombre": "Bobina Hyundai i10 28010",
        "descripcion": "Bobina de encendido para Hyundai i10, referencia 28010.",
        "precio_venta": 62_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_ENGINE,
    },
    {
        "nombre": "Bobina Hyundai i25 New",
        "descripcion": "Bobina de encendido para Hyundai i25 New.",
        "precio_venta": 62_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_ENGINE,
    },
    {
        "nombre": "Bobina Kia Picanto",
        "descripcion": "Bobina de encendido para Kia Picanto.",
        "precio_venta": 62_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_COIL,
    },
    {
        "nombre": "Bobina Toyota 448",
        "descripcion": "Bobina de encendido Toyota referencia 448.",
        "precio_venta": 85_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_PARTS,
    },
    {
        "nombre": "Bobina Aveo",
        "descripcion": "Bobina de encendido para Chevrolet Aveo.",
        "precio_venta": 75_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_WORKSHOP,
    },
    {
        "nombre": "Pilas Bosch",
        "descripcion": "Juego de bujías / pilas de encendido Bosch.",
        "precio_venta": 38_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_SPARK,
    },
    {
        "nombre": "Pila Spark GT",
        "descripcion": "Pila / bujía de encendido para Chevrolet Spark GT.",
        "precio_venta": 50_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_SPARK,
    },
    # Sensores y Electrónica
    {
        "nombre": "Sensor Oxígeno Cronos",
        "descripcion": "Sensor de oxígeno (O2 / lambda) para Fiat Cronos.",
        "precio_venta": 110_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
    },
    {
        "nombre": "Sensor Oxígeno Koleos",
        "descripcion": "Sensor de oxígeno (O2 / lambda) para Renault Koleos.",
        "precio_venta": 180_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_ELECTRONICS,
    },
    {
        "nombre": "Sensor Oxígeno Mazda 2",
        "descripcion": "Sensor de oxígeno (O2 / lambda) para Mazda 2.",
        "precio_venta": 200_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
    },
    {
        "nombre": "Sensor Oxígeno Nissan Tiida",
        "descripcion": "Sensor de oxígeno (O2 / lambda) para Nissan Tiida.",
        "precio_venta": 200_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_ELECTRONICS,
    },
]


def _get_or_create_categoria(db: Session, nombre: str, slug: str) -> Categoria:
    categoria = db.query(Categoria).filter(Categoria.slug == slug).first()
    if categoria:
        if categoria.nombre != nombre:
            categoria.nombre = nombre
        return categoria

    categoria = Categoria(nombre=nombre, slug=slug)
    db.add(categoria)
    db.flush()
    return categoria


def _upsert_producto(
    db: Session,
    *,
    nombre: str,
    descripcion: str,
    precio_venta: float,
    categoria_id: int,
    imagen_url: str,
    stock: int = DEFAULT_STOCK,
) -> tuple[Producto, bool]:
    """Inserta o actualiza un producto por nombre. Retorna (producto, creado)."""
    producto = db.query(Producto).filter(Producto.nombre == nombre).first()
    if producto:
        producto.descripcion = descripcion
        producto.precio_venta = precio_venta
        producto.categoria_id = categoria_id
        producto.imagen_url = imagen_url
        producto.activo = True
        # No sobrescribe stock si ya existe (evita borrar inventario real)
        return producto, False

    producto = Producto(
        nombre=nombre,
        descripcion=descripcion,
        precio_venta=precio_venta,
        precio_oferta=None,
        stock=stock,
        imagen_url=imagen_url,
        activo=True,
        categoria_id=categoria_id,
    )
    db.add(producto)
    return producto, True


def _ensure_admin(db: Session) -> bool:
    """Crea el admin por defecto si no existe. Retorna True si lo creó."""
    existente = db.query(Usuario).filter(Usuario.email == ADMIN_EMAIL).first()
    if existente:
        return False

    admin = Usuario(
        email=ADMIN_EMAIL,
        hashed_password=get_password_hash(ADMIN_PASSWORD),
        nombre=ADMIN_NOMBRE,
        activo=True,
    )
    db.add(admin)
    db.flush()
    return True


def seed(db: Session | None = None) -> dict[str, int]:
    """Siembra categorías, productos y admin. Idempotente: seguro re-ejecutar."""
    own_session = db is None
    session = db or SessionLocal()

    try:
        Base.metadata.create_all(bind=engine)

        admin_creado = _ensure_admin(session)

        categorias_por_slug: dict[str, Categoria] = {}
        for cat in CATEGORIAS:
            categorias_por_slug[cat["slug"]] = _get_or_create_categoria(
                session, cat["nombre"], cat["slug"]
            )
        session.flush()

        creados = 0
        actualizados = 0
        for item in PRODUCTOS:
            categoria = categorias_por_slug[item["categoria_slug"]]
            _, is_new = _upsert_producto(
                session,
                nombre=item["nombre"],
                descripcion=item["descripcion"],
                precio_venta=item["precio_venta"],
                categoria_id=categoria.id,
                imagen_url=item["imagen_url"],
            )
            if is_new:
                creados += 1
            else:
                actualizados += 1

        session.commit()
        return {
            "categorias": len(categorias_por_slug),
            "productos_creados": creados,
            "productos_actualizados": actualizados,
            "admin_creado": int(admin_creado),
        }
    except Exception:
        session.rollback()
        raise
    finally:
        if own_session:
            session.close()


def main() -> None:
    print("Sembrando catálogo de repuestos…")
    resultado = seed()
    print(
        f"Listo: {resultado['categorias']} categorías, "
        f"{resultado['productos_creados']} productos creados, "
        f"{resultado['productos_actualizados']} actualizados."
    )
    if resultado.get("admin_creado"):
        print(f"Admin creado: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    else:
        print(f"Admin ya existía: {ADMIN_EMAIL}")


if __name__ == "__main__":
    main()

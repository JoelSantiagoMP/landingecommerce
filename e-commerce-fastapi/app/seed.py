"""
Carga inicial de categorías y repuestos automotrices.

Uso (desde e-commerce-fastapi/):
    python -m app.seed
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine, ensure_producto_ficha_columns
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
        "descripcion": "Bobina de encendido BERU tipo lápiz para Renault (refs. 82 00 855 671 / 7700875000). Fabricación Alemania.",
        "precio_venta": 65_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_COIL,
        "marca_fabricante": "Beru",
        "origen": "Alemania",
        "material": "Resina epoxi / plástico técnico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Renault (verificar modelo, motor y año; refs. 82 00 855 671 / 7700875000)",
    },
    {
        "nombre": "Bobina Hyundai i10 28010",
        "descripcion": "Bobina de encendido tipo lápiz Hyundai Genuine Parts ref. 27301-2B010 (12 V, 2 terminales).",
        "precio_venta": 62_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_ENGINE,
        "marca_fabricante": "Hyundai",
        "origen": "Corea del Sur",
        "material": "Plástico reforzado / cobre",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Hyundai i10 (ref. 27301-2B010)",
    },
    {
        "nombre": "Bobina Hyundai i25 New",
        "descripcion": "Bobina de encendido tipo lápiz Hyundai/Kia Genuine Parts ref. 27301-03200 (12 V, 2 pines).",
        "precio_venta": 62_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_ENGINE,
        "marca_fabricante": "Hyundai / Denso",
        "origen": "OEM",
        "material": "Plástico reforzado / cobre",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Hyundai i25 New (ref. 27301-03200; verificar año y motor)",
    },
    {
        "nombre": "Bobina Kia Picanto",
        "descripcion": "Bobina de encendido tipo lápiz Kia/Hyundai Genuine Parts ref. 27301-03110 (12 V, 2 terminales).",
        "precio_venta": 62_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_COIL,
        "marca_fabricante": "Kia",
        "origen": "Corea del Sur",
        "material": "Plástico reforzado / cobre",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Kia Picanto New (ref. 27301-03110)",
    },
    {
        "nombre": "Bobina Toyota 448",
        "descripcion": "Bobina de encendido Toyota/Denso ref. 90919-02239 (tipo lápiz, 4 pines).",
        "precio_venta": 85_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_PARTS,
        "marca_fabricante": "Toyota / Denso",
        "origen": "Japón",
        "material": "Resina epoxi / plástico técnico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Toyota (ref. 90919-02239 / 448)",
    },
    {
        "nombre": "Bobina Toyota 02248",
        "descripcion": "Bobina Toyota/Denso Genuine Parts ref. 90919-02248 (equiv. Denso 099700-2530). Conector 4 pines.",
        "precio_venta": 85_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_PARTS,
        "marca_fabricante": "Toyota / Denso",
        "origen": "Japón",
        "material": "Resina epoxi / plástico técnico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "4Runner, Tacoma, Tundra, FJ Cruiser, RAV4, Camry, Corolla, Prado (motores 1GR-FE, 1AZ-FE, 2AZ-FE, 1NZ-FE, 2TR-FE, etc.)",
    },
    {
        "nombre": "Bobina Toyota 02258",
        "descripcion": "Bobina Toyota/Denso Genuine Parts ref. 90919-02258 (equiv. Denso 099700-2500; reemplaza 90919-02252). Conector 4 pines.",
        "precio_venta": 85_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_PARTS,
        "marca_fabricante": "Toyota / Denso",
        "origen": "Japón",
        "material": "Resina epoxi / plástico técnico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Corolla, C-HR, Matrix, Prius / Prius V, Scion iM / xD (motores 2ZR-FE, 2ZR-FAE, 2ZR-FXE, 3ZR-FAE, etc.)",
    },
    {
        "nombre": "Bobina Aveo",
        "descripcion": "Bobina / módulo de encendido GM ref. 25189296 para Chevrolet Aveo (conector 4 pines).",
        "precio_venta": 75_000,
        "categoria_slug": "encendido-y-bobinas",
        "imagen_url": IMG_WORKSHOP,
        "marca_fabricante": "GM",
        "origen": "China",
        "material": "Plástico reforzado / cobre",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Chevrolet Aveo (ref. 25189296)",
    },
    # Sistema de Combustible
    {
        "nombre": "Pilas Bosch",
        "descripcion": "Pila / bomba de gasolina eléctrica Bosch ref. 0 580 453 434 (12 V, ~3 bar, ~85 L/h).",
        "precio_venta": 38_000,
        "categoria_slug": "sistema-de-combustible",
        "imagen_url": IMG_SPARK,
        "marca_fabricante": "Bosch",
        "origen": "Alemania",
        "material": "Metal / plástico técnico",
        "contenido_caja": "1 unidad (kit con malla/arnés según lote)",
        "compatibilidad": "Consultar por referencia 0 580 453 434",
    },
    {
        "nombre": "Pila Spark GT",
        "descripcion": "Pila / bomba de gasolina eléctrica ACDelco ref. ACD3822 para Chevrolet Spark GT (12 V).",
        "precio_venta": 50_000,
        "categoria_slug": "sistema-de-combustible",
        "imagen_url": IMG_SPARK,
        "marca_fabricante": "ACDelco",
        "origen": "OEM aftermarket",
        "material": "Metal / plástico técnico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Chevrolet Spark GT (ref. ACD3822)",
    },
    # Sensores y Electrónica
    {
        "nombre": "Sensor Oxígeno Cronos",
        "descripcion": "Sensor de oxígeno / sonda lambda Chevrolet/GM Genuine Parts ref. 96415639 (3 cables, Made in Japan).",
        "precio_venta": 110_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
        "marca_fabricante": "Chevrolet / GM",
        "origen": "Japón",
        "material": "Acero inoxidable / cerámica",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Chevrolet Cronos (ref. 96415639; verificar año y motor)",
    },
    {
        "nombre": "Sensor Oxígeno Atos",
        "descripcion": "Sensor de oxígeno / sonda lambda Hyundai/Kia Genuine Parts ref. 39210-02640 (4 cables, calefactado).",
        "precio_venta": 110_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
        "marca_fabricante": "Hyundai / Kia",
        "origen": "OEM",
        "material": "Acero inoxidable / cerámica",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Hyundai Atos, Kia Picanto, Kia i10 (ref. 39210-02640)",
    },
    {
        "nombre": "Sensor Oxígeno Koleos",
        "descripcion": "Sensor de oxígeno / sonda lambda Nissan Genuine Parts para Koleos (conector 3 cables).",
        "precio_venta": 180_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_ELECTRONICS,
        "marca_fabricante": "Nissan",
        "origen": "OEM",
        "material": "Acero inoxidable / cerámica",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Nissan Koleos (verificar año y motor)",
    },
    {
        "nombre": "Sensor Oxígeno Mazda 2",
        "descripcion": "Sensor de oxígeno / sonda lambda para Mazda 2 ref. ZJ36-1 (conector 4 cables).",
        "precio_venta": 200_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
        "marca_fabricante": "Mazda",
        "origen": "OEM",
        "material": "Acero inoxidable / cerámica",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Mazda 2 (ref. ZJ36-1; verificar año, motor y posición)",
    },
    {
        "nombre": "Sensor Oxígeno Nissan Tiida",
        "descripcion": "Sensor de oxígeno / sonda lambda Nissan Genuine Parts para Tiida (4 cables, Made in Japan).",
        "precio_venta": 200_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_ELECTRONICS,
        "marca_fabricante": "Nissan",
        "origen": "Japón",
        "material": "Acero inoxidable / cerámica",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Nissan Tiida (verificar año, motor y posición)",
    },
    {
        "nombre": "Captador CKP Renault",
        "descripcion": "Captador magnético / sensor de posición del cigüeñal (CKP) Renault Genuine Parts. Lectura precisa de posición y RPM.",
        "precio_venta": 95_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_ELECTRONICS,
        "marca_fabricante": "Renault",
        "origen": "OEM",
        "material": "Plástico técnico / soporte metálico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Renault (verificar modelo, año y motor)",
    },
    {
        "nombre": "Resistencia Soplador Renault",
        "descripcion": "Resistencia / módulo motor soplador A/C y calefacción Renault Group Genuine Parts ref. 255509263R (12 V).",
        "precio_venta": 85_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_ELECTRONICS,
        "marca_fabricante": "Renault",
        "origen": "OEM",
        "material": "Plástico / jaula metálica",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Renault (ref. 255509263R; verificar modelo/año/VIN)",
    },
    {
        "nombre": "Sensor Presión Aceite Renault",
        "descripcion": "Sensor / interruptor de presión de aceite Renault Group Genuine Parts ref. 8200671275.",
        "precio_venta": 45_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
        "marca_fabricante": "Renault",
        "origen": "OEM",
        "material": "Metal / plástico",
        "contenido_caja": "1 unidad",
        "compatibilidad": "Renault (ref. 8200671275)",
    },
    {
        "nombre": "Sensor Temperatura Renault",
        "descripcion": "Sensor de temperatura de refrigerante Renault Genuine Parts ref. 22630024R (incluye arandela de sellado).",
        "precio_venta": 40_000,
        "categoria_slug": "sensores-y-electronica",
        "imagen_url": IMG_SENSOR,
        "marca_fabricante": "Renault",
        "origen": "OEM",
        "material": "Metal / plástico",
        "contenido_caja": "1 unidad + arandela",
        "compatibilidad": "Renault (ref. 22630024R)",
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
    marca_fabricante: Optional[str] = None,
    origen: Optional[str] = None,
    material: Optional[str] = None,
    contenido_caja: Optional[str] = None,
    compatibilidad: Optional[str] = None,
) -> tuple[Producto, bool]:
    """Inserta o actualiza un producto por nombre. Retorna (producto, creado)."""
    producto = db.query(Producto).filter(Producto.nombre == nombre).first()
    if producto:
        producto.descripcion = descripcion
        producto.precio_venta = precio_venta
        producto.categoria_id = categoria_id
        # No sobrescribe imagen_url ni stock (usa update_images.py / inventario real)
        producto.activo = True
        producto.marca_fabricante = marca_fabricante
        producto.origen = origen
        producto.material = material
        producto.contenido_caja = contenido_caja
        producto.compatibilidad = compatibilidad
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
        marca_fabricante=marca_fabricante,
        origen=origen,
        material=material,
        contenido_caja=contenido_caja,
        compatibilidad=compatibilidad,
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
        ensure_producto_ficha_columns()

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
                marca_fabricante=item.get("marca_fabricante"),
                origen=item.get("origen"),
                material=item.get("material"),
                contenido_caja=item.get("contenido_caja"),
                compatibilidad=item.get("compatibilidad"),
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

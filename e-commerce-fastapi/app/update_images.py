"""
Actualiza las URLs de imagen de productos (p. ej. públicas de Supabase Storage).

Uso (desde e-commerce-fastapi/):
    python -m app.update_images

Edita el diccionario IMAGE_UPDATES abajo:
  - Clave int  -> busca por producto.id
  - Clave str  -> busca por producto.nombre (SKU / nombre exacto)
  - Valor      -> nueva URL pública
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.database import Base  # noqa: F401
from app.models import Producto  # noqa: F401

# ---------------------------------------------------------------------------
# Mapa de actualizaciones: id|nombre -> URL pública de Supabase Storage
# Reemplaza los placeholders con tus URLs reales antes de ejecutar.
# ---------------------------------------------------------------------------
IMAGE_UPDATES: dict[int | str, str] = {
    # Por ID:
    # 1: "https://<project>.supabase.co/storage/v1/object/public/repuestos/bobina-beru.jpg",
    # Por nombre / SKU:
    "Bobina Beru": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    "Bobina Hyundai i10 28010": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
    "Bobina Hyundai i25 New": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
    "Bobina Kia Picanto": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    "Bobina Toyota 448": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    "Bobina Aveo": "https://images.unsplash.com/photo-1625047509165-4bdad6ce1742?auto=format&fit=crop&w=800&q=80",
    "Pilas Bosch": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80",
    "Pila Spark GT": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80",
    "Sensor Oxígeno Cronos": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    "Sensor Oxígeno Koleos": "https://images.unsplash.com/photo-1517524008699-0baad5b211d9?auto=format&fit=crop&w=800&q=80",
    "Sensor Oxígeno Mazda 2": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    "Sensor Oxígeno Nissan Tiida": "https://images.unsplash.com/photo-1517524008699-0baad5b211d9?auto=format&fit=crop&w=800&q=80",
}


def _find_producto(db: Session, key: int | str) -> Producto | None:
    if isinstance(key, int) or (isinstance(key, str) and key.isdigit()):
        return db.get(Producto, int(key))
    return db.query(Producto).filter(Producto.nombre == str(key)).first()


def update_product_images(
    updates: dict[int | str, str] | None = None,
    db: Session | None = None,
) -> dict[str, Any]:
    """
    Aplica el mapa de URLs sobre la BD configurada en DATABASE_URL
    (SQLite local o PostgreSQL en producción).
    """
    mapping = updates if updates is not None else IMAGE_UPDATES
    own_session = db is None
    session = db or SessionLocal()

    updated: list[dict[str, Any]] = []
    missing: list[str] = []

    try:
        for key, url in mapping.items():
            if not url or not str(url).strip():
                missing.append(f"{key} (URL vacía)")
                continue

            producto = _find_producto(session, key)
            if producto is None:
                missing.append(str(key))
                continue

            producto.imagen_url = str(url).strip()
            updated.append(
                {
                    "id": producto.id,
                    "nombre": producto.nombre,
                    "imagen_url": producto.imagen_url,
                }
            )

        session.commit()
        return {
            "updated_count": len(updated),
            "updated": updated,
            "missing": missing,
            "database": str(engine.url).split("@")[-1],  # host/db sin credenciales
        }
    except Exception:
        session.rollback()
        raise
    finally:
        if own_session:
            session.close()


def main() -> None:
    print("Actualizando URLs de imágenes de productos…")
    if not IMAGE_UPDATES:
        print("IMAGE_UPDATES está vacío. Edita app/update_images.py y vuelve a ejecutar.")
        return

    result = update_product_images()
    print(f"Base: …{result['database']}")
    print(f"Actualizados: {result['updated_count']}")
    for item in result["updated"]:
        print(f"  [{item['id']}] {item['nombre']}")
        print(f"      -> {item['imagen_url']}")
    if result["missing"]:
        print("No encontrados / inválidos:")
        for key in result["missing"]:
            print(f"  - {key}")


if __name__ == "__main__":
    main()

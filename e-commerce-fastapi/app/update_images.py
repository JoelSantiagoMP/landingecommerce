"""
Actualiza las URLs de imagen de productos en la BD.

Flujo recomendado (Supabase):
    python -m app.upload_images
  → sube product_images/ al bucket y escribe las URLs públicas aquí.

Uso solo-BD (URLs ya conocidas), desde e-commerce-fastapi/:
    python -m app.update_images

En Render Shell:
    python -m app.update_images
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.database import Base  # noqa: F401
from app.models import Producto  # noqa: F401

# ---------------------------------------------------------------------------
# Mapa opcional: id|nombre -> URL pública de Supabase.
# Si usas `python -m app.upload_images`, este dict puede quedar vacío:
# el uploader escribe las URLs directamente en la BD.
# ---------------------------------------------------------------------------
IMAGE_UPDATES: dict[int | str, str] = {
    "Bobina Beru": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-beru.jpg",
    "Bobina Hyundai i10 28010": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-hyundai-i10.jpg",
    "Bobina Hyundai i25 New": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-hyundai-i25-new.jpg",
    "Bobina Kia Picanto": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-kia-picanto.jpg",
    "Bobina Toyota 448": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-toyota-448.jpg",
    "Bobina Toyota 02248": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-toyota-02248.jpg",
    "Bobina Toyota 02258": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-toyota-02258.jpg",
    "Bobina Aveo": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/bobina-aveo.jpg",
    "Pila Spark GT": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/pila-spark-gt.jpg",
    "Pilas Bosch": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/pila-bomba-bosch.jpg",
    "Captador CKP Renault": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/captador-ckp-renault.jpg",
    "Resistencia Soplador Renault": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/resistencia-soplador-renault.jpg",
    "Sensor Presión Aceite Renault": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-presion-aceite-renault.jpg",
    "Sensor Oxígeno Atos": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-oxigeno-atos.jpg",
    "Sensor Oxígeno Cronos": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-oxigeno-cronos.jpg",
    "Sensor Oxígeno Koleos": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-oxigeno-koleos.jpg",
    "Sensor Oxígeno Mazda 2": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-oxigeno-mazda-2.jpg",
    "Sensor Oxígeno Nissan Tiida": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-oxigeno-nissan-tiida.jpg",
    "Sensor Temperatura Renault": "https://qmzvxsxracwdhewjsekd.supabase.co/storage/v1/object/public/repuestos/sensor-temperatura-renault.jpg",
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
            "database": str(engine.url).split("@")[-1],
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
        print(
            "IMAGE_UPDATES vacío. Usa `python -m app.upload_images` "
            "o pega URLs de Supabase aquí."
        )
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

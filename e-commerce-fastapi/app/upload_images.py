"""
Sube imágenes de product_images/ a Supabase Storage y actualiza imagen_url en la BD.

Requisitos (.env o variables de entorno):
    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings → API → service_role (nunca en el frontend)
    SUPABASE_STORAGE_BUCKET=repuestos  # opcional; default: repuestos
    DATABASE_URL=...                   # Postgres de Render si actualizas producción

Uso (desde e-commerce-fastapi/):
    python -m app.upload_images

En Render Shell (con las env de Supabase configuradas en el servicio):
    python -m app.upload_images
"""

from __future__ import annotations

import mimetypes
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.update_images import update_product_images

# Carpeta con lotes: product_images/<slug>/01-producto.jpg
PRODUCT_IMAGES_DIR = Path(__file__).resolve().parent.parent / "product_images"

# nombre exacto en BD -> archivo local relativo a product_images/
# La foto principal de catálogo suele ser 01-producto.jpg
IMAGE_FILES: dict[str, str] = {
    # Catálogo completo con fotos reales
    "Bobina Beru": "bobina-beru/01-producto.jpg",
    "Bobina Hyundai i10 28010": "bobina-hyundai-i10/01-producto.jpg",
    "Bobina Hyundai i25 New": "bobina-hyundai-i25-new/01-producto.jpg",
    "Bobina Kia Picanto": "bobina-kia-picanto/01-producto.jpg",
    "Bobina Toyota 448": "bobina-toyota-448/01-producto.jpg",
    "Bobina Toyota 02248": "bobina-toyota-02248/01-producto.jpg",
    "Bobina Toyota 02258": "bobina-toyota-02258/01-producto.jpg",
    "Bobina Aveo": "bobina-aveo/01-producto.jpg",
    "Pila Spark GT": "pila-spark-gt/01-producto.jpg",
    "Pilas Bosch": "pila-bomba-bosch/01-producto.jpg",
    "Captador CKP Renault": "captador-ckp-renault/01-producto.jpg",
    "Resistencia Soplador Renault": "resistencia-soplador-renault/01-producto.jpg",
    "Sensor Presión Aceite Renault": "sensor-presion-aceite-renault/01-producto.jpg",
    "Sensor Oxígeno Atos": "sensor-oxigeno-atos/01-producto.jpg",
    "Sensor Oxígeno Cronos": "sensor-oxigeno-cronos/01-producto.jpg",
    "Sensor Oxígeno Koleos": "sensor-oxigeno-koleos/01-producto.jpg",
    "Sensor Oxígeno Mazda 2": "sensor-oxigeno-mazda-2/01-producto.jpg",
    "Sensor Oxígeno Nissan Tiida": "sensor-oxigeno-nissan-tiida/01-producto.jpg",
    "Sensor Temperatura Renault": "sensor-temperatura-renault/01-producto.jpg",
}


def _storage_object_path(local_rel: str) -> str:
    """Ruta estable en el bucket: bobina-toyota-448.jpg"""
    slug = local_rel.split("/")[0]
    ext = Path(local_rel).suffix.lower() or ".jpg"
    return f"{slug}{ext}"


def _public_url(base_url: str, bucket: str, object_path: str) -> str:
    return (
        f"{base_url.rstrip('/')}/storage/v1/object/public/"
        f"{bucket}/{object_path.lstrip('/')}"
    )


def _ensure_bucket(client: Any, bucket: str) -> None:
    existing = {b.name for b in client.storage.list_buckets()}
    if bucket in existing:
        return
    client.storage.create_bucket(bucket, options={"public": True})
    print(f"Bucket creado (público): {bucket}")


def upload_product_images(
    files: dict[str, str] | None = None,
    *,
    update_db: bool = True,
) -> dict[str, Any]:
    """
    Sube archivos a Supabase y opcionalmente escribe las URLs públicas en la BD.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY. "
            "Configúralos en .env o en las env vars de Render."
        )

    try:
        from supabase import create_client
    except ImportError as exc:
        raise RuntimeError(
            "Instala el cliente: pip install supabase"
        ) from exc

    mapping = files if files is not None else IMAGE_FILES
    bucket = settings.SUPABASE_STORAGE_BUCKET or "repuestos"
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    _ensure_bucket(client, bucket)

    uploaded: dict[str, str] = {}
    errors: list[str] = []

    for nombre, rel_path in mapping.items():
        local = PRODUCT_IMAGES_DIR / rel_path
        if not local.is_file():
            errors.append(f"{nombre}: no existe {local}")
            continue

        object_path = _storage_object_path(rel_path)
        content_type = mimetypes.guess_type(local.name)[0] or "image/jpeg"
        data = local.read_bytes()

        try:
            client.storage.from_(bucket).upload(
                object_path,
                data,
                file_options={
                    "content-type": content_type,
                    "upsert": "true",
                },
            )
        except Exception as exc:  # noqa: BLE001 — reportar y seguir con el lote
            errors.append(f"{nombre}: upload falló ({exc})")
            continue

        url = _public_url(settings.SUPABASE_URL, bucket, object_path)
        uploaded[nombre] = url
        print(f"  OK  {nombre}")
        print(f"      -> {url}")

    db_result: dict[str, Any] | None = None
    if update_db and uploaded:
        db_result = update_product_images(uploaded)

    return {
        "uploaded_count": len(uploaded),
        "uploaded": uploaded,
        "errors": errors,
        "bucket": bucket,
        "db": db_result,
    }


def main() -> None:
    print("Subiendo imágenes a Supabase Storage…")
    if not IMAGE_FILES:
        print("IMAGE_FILES está vacío. Añade mapeos en app/upload_images.py.")
        return

    result = upload_product_images()
    print(f"\nBucket: {result['bucket']}")
    print(f"Subidas: {result['uploaded_count']}")
    if result["errors"]:
        print("Errores:")
        for err in result["errors"]:
            print(f"  - {err}")
    if result.get("db"):
        db = result["db"]
        print(f"BD actualizada: {db['updated_count']} productos")
        if db.get("missing"):
            print("No encontrados en BD:")
            for key in db["missing"]:
                print(f"  - {key}")


if __name__ == "__main__":
    main()

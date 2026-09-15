from collections.abc import Generator
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


def normalize_database_url(url: str) -> str:
    """
    Normaliza URLs de Postgres (Render usa a menudo postgres://).
    Fuerza el driver psycopg2: postgresql+psycopg2://...
    """
    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://") :]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://") :]
    return url


def ensure_postgres_ssl(url: str) -> str:
    """Agrega sslmode=require en Postgres remoto si no está definido (p. ej. Render)."""
    if not url.startswith("postgresql"):
        return url

    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host in {"localhost", "127.0.0.1", "::1"}:
        return url

    query = parse_qs(parsed.query, keep_blank_values=True)
    if "sslmode" not in query:
        query["sslmode"] = ["require"]
        parsed = parsed._replace(query=urlencode(query, doseq=True))
        return urlunparse(parsed)
    return url


def build_engine_kwargs(database_url: str) -> dict:
    """Argumentos de create_engine según el motor (SQLite vs PostgreSQL)."""
    is_sqlite = database_url.startswith("sqlite")
    is_postgres = database_url.startswith("postgresql")

    kwargs: dict = {
        "pool_pre_ping": True,
    }

    if is_sqlite:
        kwargs["connect_args"] = {"check_same_thread": False}
    elif is_postgres:
        # Pool adecuado para web services en Render / producción
        kwargs.update(
            {
                "pool_size": 5,
                "max_overflow": 10,
                "pool_recycle": 1800,
            }
        )

    return kwargs


DATABASE_URL = ensure_postgres_ssl(normalize_database_url(settings.DATABASE_URL))

engine = create_engine(DATABASE_URL, **build_engine_kwargs(DATABASE_URL))

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Clase base para todos los modelos SQLAlchemy."""

    pass


# Columnas de ficha técnica añadidas tras el esquema inicial (create_all no las crea).
_PRODUCTO_FICHA_COLUMNS: dict[str, str] = {
    "marca_fabricante": "VARCHAR(100)",
    "origen": "VARCHAR(100)",
    "material": "VARCHAR(200)",
    "contenido_caja": "VARCHAR(100)",
    "compatibilidad": "TEXT",
}


def ensure_producto_ficha_columns() -> None:
    """Agrega columnas de ficha técnica a productos si faltan (SQLite/Postgres)."""
    inspector = inspect(engine)
    if "productos" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("productos")}
    missing = {
        name: ddl for name, ddl in _PRODUCTO_FICHA_COLUMNS.items() if name not in existing
    }
    if not missing:
        return

    with engine.begin() as conn:
        for name, ddl in missing.items():
            conn.execute(text(f"ALTER TABLE productos ADD COLUMN {name} {ddl}"))


def get_db() -> Generator[Session, None, None]:
    """Dependencia de FastAPI que provee una sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

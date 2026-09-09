from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# SQLite requiere check_same_thread=False para uso con FastAPI
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Clase base para todos los modelos SQLAlchemy."""

    pass


def get_db() -> Generator[Session, None, None]:
    """Dependencia de FastAPI que provee una sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

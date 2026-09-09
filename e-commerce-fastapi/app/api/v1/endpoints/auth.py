from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.schemas.usuario import Token, UsuarioOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """Autenticación OAuth2: username = email, password = contraseña."""
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if (
        usuario is None
        or not usuario.activo
        or not verify_password(form_data.password, usuario.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=usuario.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={"email": usuario.email},
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UsuarioOut)
def me(current_admin: Usuario = Depends(get_current_admin)) -> Usuario:
    return current_admin

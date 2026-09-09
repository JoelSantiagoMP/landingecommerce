from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nombre: str = Field(..., min_length=1, max_length=150)


class UsuarioOut(BaseModel):
    id: int
    email: EmailStr
    nombre: str
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

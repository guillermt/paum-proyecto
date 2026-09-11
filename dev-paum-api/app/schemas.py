from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ----- ENUM PARA ROL -----
class Rol(str, Enum):
    admin = "admin"
    estudiante = "estudiante"

# ----- USUARIOS -----
class UsuarioBase(BaseModel):
    nombre_usuario: str
    email: EmailStr
    rol: Rol = Rol.estudiante

class UsuarioCreate(BaseModel):
    nombre_usuario: str
    email: EmailStr
    contraseña: str = Field(..., min_length=6)

    model_config = {"extra": "forbid"}

class UsuarioAdminCreate(BaseModel):
    nombre_usuario: str
    email: EmailStr
    contraseña: str = Field(..., min_length=6)

    model_config = {"extra": "forbid"}

class UsuarioUpdate(BaseModel):
    nombre_usuario: Optional[str] = None
    email: Optional[EmailStr] = None
    contraseña: Optional[str] = Field(None, min_length=6)
    rol: Optional[Rol] = None

class UsuarioResponse(UsuarioBase):
    id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True

# ----- MATERIAS -----
class MateriaBase(BaseModel):
    nombre: str
    semestre: int = Field(..., ge=1, le=12)  # Validación de rango

class MateriaCreate(MateriaBase):
    pass

class MateriaUpdate(BaseModel):
    nombre: Optional[str] = None
    semestre: Optional[int] = Field(None, ge=1, le=12)

class MateriaResponse(MateriaBase):
    id: int

    class Config:
        from_attributes = True

# ----- ARCHIVOS -----
class ArchivoBase(BaseModel):
    nombre: str
    descripcion: str

class ArchivoCreate(ArchivoBase):
    tipo: str  # MIME type (se extraerá del archivo)
   

class ArchivoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    

class ArchivoResponse(ArchivoBase):
    id: int
    tipo: str
    fecha_subida: datetime

    class Config:
        from_attributes = True

# ----- RELACION MATERIA-ARCHIVO -----
class MateriaArchivoBase(BaseModel):
    materia_id: int = Field(..., ge=1)
    archivo_id: int = Field(..., ge=1)

class MateriaArchivoCreate(MateriaArchivoBase):
    pass

class MateriaArchivoUpdate(BaseModel):
    materia_id: Optional[int] = Field(None, ge=1)
    archivo_id: Optional[int] = Field(None, ge=1)

class MateriaArchivoResponse(MateriaArchivoBase):
    class Config:
        from_attributes = True

# Resolver referencias circulares
MateriaResponse.model_rebuild()
ArchivoResponse.model_rebuild()
MateriaArchivoResponse.model_rebuild()
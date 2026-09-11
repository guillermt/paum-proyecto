from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, Table, Enum
from sqlalchemy.dialects.mysql import LONGBLOB  # <-- Cambio aquí
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


# Enumeración para roles (opcional pero buena práctica)
class RolUsuario(enum.Enum):
    admin = "admin"
    estudiante = "estudiante"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_usuario = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    contraseña = Column(String(100), nullable=False)  # Hash almacenado
    rol = Column(Enum(RolUsuario), default=RolUsuario.estudiante)
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow)

class Materia(Base):
    __tablename__ = "materias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False, index=True)
    semestre = Column(Integer, nullable=False)  # 1,2,3,...

    archivos = relationship(
        "Archivo",
        secondary="materia_archivo",
        back_populates="materias",
    )


class Archivo(Base):
    __tablename__ = "archivos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo = Column(String(100), nullable=False)  # MIME type (ej. application/pdf)
    contenido = Column(LONGBLOB, nullable=False)
    fecha_subida = Column(TIMESTAMP, default=datetime.utcnow)

    materias = relationship(
        "Materia",
        secondary="materia_archivo",
        back_populates="archivos",
    )

# Tabla intermedia (muchos a muchos entre materia y archivo)

class MateriaArchivo(Base):
    __tablename__ = "materia_archivo"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    materia_id = Column(
        Integer,
        ForeignKey("materias.id", ondelete="CASCADE"),
        primary_key=True,
    )
    archivo_id = Column(
        Integer,
        ForeignKey("archivos.id", ondelete="CASCADE"),
        primary_key=True,
    )


# Alias de compatibilidad con el nombre usado anteriormente.
materia_archivo = MateriaArchivo
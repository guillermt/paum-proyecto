
from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import get_password_hash
from fastapi import HTTPException, status

# ----- USUARIOS -----
def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def get_usuario_by_username(db: Session, username: str):
    return db.query(models.Usuario).filter(models.Usuario.nombre_usuario == username).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).offset(skip).limit(limit).all()

def create_usuario(
    db: Session,
    usuario: schemas.UsuarioCreate | schemas.UsuarioAdminCreate,
    rol: models.RolUsuario,
):
    # Verificar si email o nombre de usuario ya existen
    if get_usuario_by_email(db, usuario.email):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    if db.query(models.Usuario).filter(models.Usuario.nombre_usuario == usuario.nombre_usuario).first():
        raise HTTPException(status_code=400, detail="Nombre de usuario ya existe")
    
    hashed = get_password_hash(usuario.contraseña)
    db_usuario = models.Usuario(
        nombre_usuario=usuario.nombre_usuario,
        email=usuario.email,
        contraseña=hashed,
        rol=rol
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def update_usuario(db: Session, usuario_id: int, usuario_update: schemas.UsuarioUpdate):
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        return None
    
    update_data = usuario_update.dict(exclude_unset=True)
    if "contraseña" in update_data:
        update_data["contraseña"] = get_password_hash(update_data["contraseña"])
    
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, usuario_id: int):
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        return False
    db.delete(db_usuario)
    db.commit()
    return True

# ----- MATERIAS -----
def get_materia(db: Session, materia_id: int):
    return db.query(models.Materia).filter(models.Materia.id == materia_id).first()

def get_materias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Materia).offset(skip).limit(limit).all()

def get_materias_por_semestre(
    db: Session,
    semestre: int,
    skip: int = 0,
    limit: int = 100,
):
    return (
        db.query(models.Materia)
        .filter(models.Materia.semestre == semestre)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_materia(db: Session, materia: schemas.MateriaCreate):
    # Verificar duplicado de nombre
    existing = db.query(models.Materia).filter(models.Materia.nombre == materia.nombre).first()
    if existing:
        raise HTTPException(status_code=400, detail="Materia ya existe")
    
    db_materia = models.Materia(**materia.dict())
    db.add(db_materia)
    db.commit()
    db.refresh(db_materia)
    return db_materia

def update_materia(db: Session, materia_id: int, materia_update: schemas.MateriaUpdate):
    db_materia = get_materia(db, materia_id)
    if not db_materia:
        return None
    
    update_data = materia_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_materia, key, value)
    
    db.commit()
    db.refresh(db_materia)
    return db_materia

def delete_materia(db: Session, materia_id: int):
    db_materia = get_materia(db, materia_id)
    if not db_materia:
        return False
    db.delete(db_materia)
    db.commit()
    return True

# ----- ARCHIVOS -----
def get_archivo(db: Session, archivo_id: int):
    return db.query(models.Archivo).filter(models.Archivo.id == archivo_id).first()

def get_archivos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Archivo).offset(skip).limit(limit).all()

def get_archivos_por_materia(
    db: Session,
    materia_id: int,
    skip: int = 0,
    limit: int = 100,
):
    return (
        db.query(models.Archivo)
        .join(
            models.MateriaArchivo,
            models.MateriaArchivo.archivo_id == models.Archivo.id,
        )
        .filter(models.MateriaArchivo.materia_id == materia_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_archivo(db: Session, archivo_data: schemas.ArchivoCreate, contenido_bytes: bytes):
    db_archivo = models.Archivo(
        nombre=archivo_data.nombre,
        descripcion=archivo_data.descripcion,
        tipo=archivo_data.tipo,
        contenido=contenido_bytes
    )
    db.add(db_archivo)
    db.commit()
    db.refresh(db_archivo)
    return db_archivo

def update_archivo(db: Session, archivo_id: int, archivo_update: schemas.ArchivoUpdate):
    db_archivo = get_archivo(db, archivo_id)
    if not db_archivo:
        return None
    
    update_data = archivo_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_archivo, key, value)

    db.commit()
    db.refresh(db_archivo)
    return db_archivo

def delete_archivo(db: Session, archivo_id: int):
    db_archivo = get_archivo(db, archivo_id)
    if not db_archivo:
        return False
    db.delete(db_archivo)
    db.commit()
    return True

# ----- RELACIONES MATERIA-ARCHIVO -----
def get_materia_archivo(db: Session, materia_id: int, archivo_id: int):
    return db.query(models.MateriaArchivo).filter(
        models.MateriaArchivo.materia_id == materia_id,
        models.MateriaArchivo.archivo_id == archivo_id,
    ).first()


def get_materias_archivos(
    db: Session,
    materia_id: int | None = None,
    archivo_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(models.MateriaArchivo)
    if materia_id is not None:
        query = query.filter(models.MateriaArchivo.materia_id == materia_id)
    if archivo_id is not None:
        query = query.filter(models.MateriaArchivo.archivo_id == archivo_id)
    return query.offset(skip).limit(limit).all()


def create_materia_archivo(
    db: Session,
    relacion: schemas.MateriaArchivoCreate,
):
    if not get_materia(db, relacion.materia_id):
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    if not get_archivo(db, relacion.archivo_id):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    if get_materia_archivo(db, relacion.materia_id, relacion.archivo_id):
        raise HTTPException(status_code=409, detail="La relación ya existe")

    db_relacion = models.MateriaArchivo(**relacion.model_dump())
    db.add(db_relacion)
    db.commit()
    db.refresh(db_relacion)
    return db_relacion


def update_materia_archivo(
    db: Session,
    materia_id: int,
    archivo_id: int,
    relacion_update: schemas.MateriaArchivoUpdate,
):
    db_relacion = get_materia_archivo(db, materia_id, archivo_id)
    if not db_relacion:
        return None

    update_data = relacion_update.model_dump(exclude_unset=True)
    nuevo_materia_id = update_data.get("materia_id", materia_id)
    nuevo_archivo_id = update_data.get("archivo_id", archivo_id)

    if not get_materia(db, nuevo_materia_id):
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    if not get_archivo(db, nuevo_archivo_id):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    if (nuevo_materia_id, nuevo_archivo_id) != (materia_id, archivo_id):
        if get_materia_archivo(db, nuevo_materia_id, nuevo_archivo_id):
            raise HTTPException(status_code=409, detail="La relación ya existe")

    db_relacion.materia_id = nuevo_materia_id
    db_relacion.archivo_id = nuevo_archivo_id
    db.commit()
    db.refresh(db_relacion)
    return db_relacion


def delete_materia_archivo(db: Session, materia_id: int, archivo_id: int):
    db_relacion = get_materia_archivo(db, materia_id, archivo_id)
    if not db_relacion:
        return False
    db.delete(db_relacion)
    db.commit()
    return True
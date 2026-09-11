from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_admin, get_current_user, create_access_token, verify_password
from datetime import timedelta
from app.models import RolUsuario, Usuario

router = APIRouter(prefix="/users", tags=["users"])
security = HTTPBasic()



@router.post("/login/")
async def login_json(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Faltan credenciales")
    
    # Buscar por email o nombre_usuario (usando los nombres correctos)
    user = crud.get_usuario_by_email(db, email=username)
    if not user:
        user = crud.get_usuario_by_username(db, username)
    
    if not user or not verify_password(password, user.contraseña):
        raise HTTPException(status_code=400, detail="Credenciales inválidas")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "nombre_usuario": user.nombre_usuario,
        "rol": user.rol.value if hasattr(user.rol, 'value') else user.rol
    }

# --- Obtener perfil del usuario actual ---
@router.get("/me/")
async def get_me(current_user: Usuario = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nombre_usuario": current_user.nombre_usuario,
        "rol": current_user.rol.value if hasattr(current_user.rol, 'value') else current_user.rol,
        "fecha_creacion": current_user.fecha_creacion
    }

# --- Logout (opcional) ---
@router.get("/logout/")
async def logout():
    return {"message": "Sesión cerrada correctamente"}

@router.post("/crear-usuario", response_model=schemas.UsuarioResponse, status_code=201)
def create_user(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return crud.create_usuario(db, user, rol=RolUsuario.estudiante)

@router.post(
    "/crear-admin/",
    response_model=schemas.UsuarioResponse,
    status_code=201,
)
def create_admin(
    user: schemas.UsuarioAdminCreate,
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin),
):
    return crud.create_usuario(db, user, rol=RolUsuario.admin)

@router.patch(
    "/promover-admin/{user_id}",
    response_model=schemas.UsuarioResponse,
)
def promote_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Usuario = Depends(get_current_admin),
):
    usuario = crud.get_usuario(db, user_id)

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.rol = RolUsuario.admin
    db.commit()
    db.refresh(usuario)
    return usuario

@router.get("/todos-usuarios", response_model=List[schemas.UsuarioResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_usuarios(db, skip=skip, limit=limit)

@router.get("/obtener-usuario/{user_id}", response_model=schemas.UsuarioResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_usuario(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@router.put("/actualizar-usuario/{user_id}", response_model=schemas.UsuarioResponse)
def update_user(user_id: int, user_update: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_usuario(db, user_id, user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@router.delete("/eliminar-usuario/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = crud.delete_usuario(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return None
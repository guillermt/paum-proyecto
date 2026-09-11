from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/archivos", tags=["archivos"])

@router.post("/registrar-archivo", response_model=schemas.ArchivoResponse, status_code=201)
async def create_archivo(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Leer contenido binario
    contenido_bytes = await archivo.read()
    
    # Construir objeto ArchivoCreate
    archivo_data = schemas.ArchivoCreate(
        nombre=nombre,
        descripcion=descripcion,
        tipo=archivo.content_type or "application/octet-stream",  # MIME type
    )
    
    return crud.create_archivo(db, archivo_data, contenido_bytes)

@router.get("/todos-archivos", response_model=List[schemas.ArchivoResponse])
def read_archivos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_archivos(db, skip=skip, limit=limit)

@router.get("/obtener-archivo/{archivo_id}", response_model=schemas.ArchivoResponse)
def read_archivo(archivo_id: int, db: Session = Depends(get_db)):
    db_archivo = crud.get_archivo(db, archivo_id)
    if not db_archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return db_archivo

@router.get("/descargar-archivo/{archivo_id}")
def descargar_archivo(archivo_id: int, db: Session = Depends(get_db)):
    """Devuelve el contenido binario del archivo para visualización o descarga."""
    db_archivo = crud.get_archivo(db, archivo_id)
    if not db_archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Devolver el contenido con el tipo MIME adecuado
    return Response(
        content=db_archivo.contenido,
        media_type=db_archivo.tipo,
        headers={
            "Content-Disposition": f"inline; filename={db_archivo.nombre}"  # inline para visualizar, attachment para forzar descarga
        }
    )

@router.put("/actualizar-archivo/{archivo_id}", response_model=schemas.ArchivoResponse)
def update_archivo(archivo_id: int, archivo_update: schemas.ArchivoUpdate, db: Session = Depends(get_db)):
    db_archivo = crud.update_archivo(db, archivo_id, archivo_update)
    if not db_archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return db_archivo

@router.delete("/eliminar-archivo/{archivo_id}", status_code=204)
def delete_archivo(archivo_id: int, db: Session = Depends(get_db)):
    success = crud.delete_archivo(db, archivo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return None
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/materias", tags=["materias"])

@router.post("/registrar-materia", response_model=schemas.MateriaResponse, status_code=201)
def create_materia(materia: schemas.MateriaCreate, db: Session = Depends(get_db)):
    return crud.create_materia(db, materia)

@router.get("/todos-materias", response_model=List[schemas.MateriaResponse])
def read_materias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_materias(db, skip=skip, limit=limit)

@router.get("/obtener-materias-semestre/{semestre}", response_model=List[schemas.MateriaResponse])
def read_materias_por_semestre(
    semestre: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud.get_materias_por_semestre(
        db,
        semestre=semestre,
        skip=skip,
        limit=limit,
    )

@router.get("/obtener-materia/{materia_id}", response_model=schemas.MateriaResponse)
def read_materia(materia_id: int, db: Session = Depends(get_db)):
    db_materia = crud.get_materia(db, materia_id)
    if not db_materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    return db_materia

@router.put("/actualizar-materia/{materia_id}", response_model=schemas.MateriaResponse)
def update_materia(materia_id: int, materia_update: schemas.MateriaUpdate, db: Session = Depends(get_db)):
    db_materia = crud.update_materia(db, materia_id, materia_update)
    if not db_materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    return db_materia

@router.delete("/eliminar-materia/{materia_id}", status_code=204)
def delete_materia(materia_id: int, db: Session = Depends(get_db)):
    success = crud.delete_materia(db, materia_id)
    if not success:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    return None
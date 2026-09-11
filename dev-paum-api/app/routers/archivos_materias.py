from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/archivos-materias", tags=["archivos-materias"])


@router.post(
	"/registrar-relacion",
	response_model=schemas.MateriaArchivoResponse,
	status_code=201,
)
def create_archivo_materia(
	relacion: schemas.MateriaArchivoCreate,
	db: Session = Depends(get_db),
):
	return crud.create_materia_archivo(db, relacion)


@router.get(
	"/obtener-archivos/{materia_id}",
	response_model=List[schemas.ArchivoResponse],
)
def read_archivos_por_materia(
	materia_id: int,
	skip: int = 0,
	limit: int = 100,
	db: Session = Depends(get_db),
):
	if not crud.get_materia(db, materia_id):
		raise HTTPException(status_code=404, detail="Materia no encontrada")

	return crud.get_archivos_por_materia(
		db,
		materia_id=materia_id,
		skip=skip,
		limit=limit,
	)


@router.delete(
	"/eliminar-relacion/{materia_id}/{archivo_id}",
	status_code=204,
)
def delete_materia_archivo(
	materia_id: int,
	archivo_id: int,
	db: Session = Depends(get_db),
):
	success = crud.delete_materia_archivo(db, materia_id, archivo_id)
	if not success:
		raise HTTPException(status_code=404, detail="Relación no encontrada")
	return None

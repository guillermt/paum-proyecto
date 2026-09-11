from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import users, materias, archivos, archivos_materias

# Crear tablas en la base de datos (si no existen)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Biblioteca Digital de Urgencias Médicas",
    description="API para gestión de archivos educativos por materias",
    version="1.0.0"
)

# Configurar CORS para permitir Angular y credenciales (cookies)
origins = [
    "http://localhost:4200",      # entorno de desarrollo de Angular
    "http://localhost:8000",
    # añade otros dominios si es necesario
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(users.router)
app.include_router(materias.router)
app.include_router(archivos.router)
app.include_router(archivos_materias.router)

@app.get("/")
def root():
    return {"message": "API de Biblioteca de Urgencias Médicas funcionando"}
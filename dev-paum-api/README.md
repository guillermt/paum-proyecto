# Backend - Biblioteca Digital de Urgencias Médicas

API REST para gestionar usuarios, materias, archivos educativos y la relación entre materias y archivos. Está construida con **FastAPI**, **SQLAlchemy**, **MySQL** y autenticación mediante **JWT**.

## 1. Tecnologías

- Python 3.12 o compatible.
- FastAPI y Uvicorn.
- SQLAlchemy 2.x.
- MySQL mediante PyMySQL.
- Pydantic para validación de datos.
- `python-jose` para tokens JWT.
- `pbkdf2_sha256` para almacenar contraseñas cifradas.

## 2. Estructura principal

```text
app/
├── main.py                 # Inicialización de FastAPI, CORS y routers
├── auth.py                 # JWT, hash de contraseñas y permisos de admin
├── database.py             # Conexión y sesiones SQLAlchemy
├── models.py               # Tablas y relaciones de la base de datos
├── schemas.py              # Validación de entrada y salida con Pydantic
├── crud.py                 # Operaciones de persistencia
└── routers/
    ├── users.py            # Usuarios y autenticación
    ├── materias.py         # Materias
    ├── archivos.py         # Archivos y descargas
    └── archivos_materias.py # Relaciones materia-archivo
```

## 3. Instalación y ejecución

Crear y activar un entorno virtual en la raíz del proyecto:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crear la base de datos `biblioteca` en MySQL y configurar las variables de entorno. La conexión por defecto es:

```text
mysql+pymysql://root@localhost:3306/biblioteca
```

Se recomienda usar un archivo `.env`:

```env
DATABASE_URL=mysql+pymysql://usuario:contraseña@localhost:3306/biblioteca
SECRET_KEY=clave-secreta-larga-y-aleatoria
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Iniciar el backend:

```powershell
uvicorn app.main:app --reload
```

La API queda disponible normalmente en `http://localhost:8000`.

> Al iniciar, `main.py` ejecuta `Base.metadata.create_all(bind=engine)`. Esto crea las tablas que no existan; para cambios estructurales en producción se recomienda usar migraciones.

## 4. Documentación interactiva

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Comprobación básica: `GET /`

En Swagger, pulsar **Authorize** y enviar `Bearer <token>` cuando la operación requiera autenticación.

**Captura sugerida 1:** colocar aquí una imagen de Swagger mostrando los grupos `users`, `materias`, `archivos` y `archivos-materias`.

## 5. Autenticación y autorización

### Inicio de sesión

`POST /users/login/`

```json
{
  "username": "correo@ejemplo.com",
  "password": "contraseña"
}
```

El campo `username` acepta el correo o el nombre de usuario. La respuesta contiene `token`, `token_type`, `id`, `email`, `nombre_usuario` y `rol`.

El token contiene el identificador del usuario (`sub`). En cada solicitud protegida se valida el token y se consulta nuevamente el usuario en la base de datos. El permiso de administrador se comprueba comparando el valor de `RolUsuario.admin`.

### Usuarios y roles

- El registro público crea siempre usuarios con rol `estudiante`.
- `POST /users/crear-admin/` crea un registro nuevo con rol `admin`, pero requiere un admin existente.
- `PATCH /users/promover-admin/{user_id}` cambia el rol de un usuario existente a `admin`, sin solicitar contraseña ni crear otro registro.
- Un usuario no administrador recibe `403` al usar operaciones protegidas.
- Un token ausente, inválido o expirado produce `401`.

> Para crear el primer administrador no puede utilizarse una ruta que ya exige un admin. Debe hacerse mediante un procedimiento inicial controlado en la base de datos o un script de administración.

**Captura sugerida 2:** colocar aquí una imagen del botón **Authorize** con el token oculto o difuminado. Nunca mostrar contraseñas, tokens, `SECRET_KEY` ni credenciales de MySQL.

## 6. Endpoints de usuarios

Prefijo: `/users`

| Método | Ruta                            | Descripción                                | Acceso              |
| ------ | ------------------------------- | ------------------------------------------ | ------------------- |
| POST   | `/login/`                       | Inicia sesión y genera JWT.                | Público             |
| GET    | `/me/`                          | Devuelve el perfil del token actual.       | Token               |
| GET    | `/logout/`                      | Respuesta informativa de cierre de sesión. | Público             |
| POST   | `/crear-usuario`                | Registra un estudiante. No acepta `rol`.   | Público             |
| POST   | `/crear-admin/`                 | Crea un administrador nuevo.               | Admin               |
| PATCH  | `/promover-admin/{user_id}`     | Promueve un usuario existente.             | Admin               |
| GET    | `/todos-usuarios`               | Lista usuarios con `skip` y `limit`.       | Actualmente público |
| GET    | `/obtener-usuario/{user_id}`    | Obtiene un usuario.                        | Actualmente público |
| PUT    | `/actualizar-usuario/{user_id}` | Actualiza datos permitidos, incluido rol.  | Actualmente público |
| DELETE | `/eliminar-usuario/{user_id}`   | Elimina un usuario.                        | Actualmente público |

Registro de estudiante:

```json
{
  "nombre_usuario": "estudiante01",
  "email": "estudiante@example.com",
  "contraseña": "secreto123"
}
```

Promoción de un usuario existente:

```http
PATCH /users/promover-admin/5
Authorization: Bearer <token-de-un-admin>
```

No se envía cuerpo. La respuesta es el usuario actualizado.

**Captura sugerida 3:** colocar aquí una captura de `PATCH /users/promover-admin/{user_id}` con respuesta `200` y el campo `rol: "admin"`.

## 7. Endpoints de materias

Prefijo: `/materias`

| Método | Ruta                                    | Descripción                       |
| ------ | --------------------------------------- | --------------------------------- |
| POST   | `/registrar-materia`                    | Crea una materia.                 |
| GET    | `/todos-materias`                       | Lista materias (`skip`, `limit`). |
| GET    | `/obtener-materias-semestre/{semestre}` | Filtra por semestre.              |
| GET    | `/obtener-materia/{materia_id}`         | Obtiene una materia.              |
| PUT    | `/actualizar-materia/{materia_id}`      | Actualiza una materia.            |
| DELETE | `/eliminar-materia/{materia_id}`        | Elimina una materia.              |

El semestre debe estar entre `1` y `12`.

Ejemplo:

```json
{
  "nombre": "Anatomía",
  "semestre": 1
}
```

**Captura sugerida 4:** colocar aquí una captura de creación y consulta de materias filtradas por semestre.

## 8. Endpoints de archivos

Prefijo: `/archivos`

| Método | Ruta                               | Descripción                                |
| ------ | ---------------------------------- | ------------------------------------------ |
| POST   | `/registrar-archivo`               | Sube un archivo con `multipart/form-data`. |
| GET    | `/todos-archivos`                  | Lista archivos (`skip`, `limit`).          |
| GET    | `/obtener-archivo/{archivo_id}`    | Devuelve metadatos.                        |
| GET    | `/descargar-archivo/{archivo_id}`  | Devuelve el contenido binario.             |
| PUT    | `/actualizar-archivo/{archivo_id}` | Actualiza nombre y descripción.            |
| DELETE | `/eliminar-archivo/{archivo_id}`   | Elimina un archivo.                        |

Campos de la subida:

- `nombre`: texto obligatorio.
- `descripcion`: texto obligatorio.
- `archivo`: archivo obligatorio.

El MIME se obtiene del archivo y su contenido se almacena en la columna `contenido` como `LONGBLOB`.

**Captura sugerida 5:** colocar aquí una captura de Swagger con el formulario `multipart/form-data` y otra de la descarga o visualización de un archivo. Evitar mostrar información sensible.

## 9. Relación materia-archivo

Prefijo: `/archivos-materias`

| Método | Ruta                                           | Descripción                        |
| ------ | ---------------------------------------------- | ---------------------------------- |
| POST   | `/registrar-relacion`                          | Asocia un archivo con una materia. |
| GET    | `/obtener-archivos/{materia_id}`               | Lista archivos de una materia.     |
| DELETE | `/eliminar-relacion/{materia_id}/{archivo_id}` | Elimina la asociación.             |

Crear una relación:

```json
{
  "materia_id": 1,
  "archivo_id": 3
}
```

La API devuelve `404` si la materia o el archivo no existen y `409` si la relación ya existe.

**Captura sugerida 6:** colocar aquí una captura de una relación creada y de la consulta de archivos por materia.

## 10. Modelo de datos

- `usuarios`: identidad, correo único, contraseña cifrada, rol y fecha de creación.
- `materias`: nombre y semestre.
- `archivos`: nombre, descripción, MIME, contenido binario y fecha de subida.
- `materia_archivo`: tabla intermedia entre materias y archivos.

Relaciones principales:

```text
Materia 1 ─── N materia_archivo N ─── 1 Archivo
```

Los identificadores de las relaciones usan claves foráneas con eliminación en cascada.

**Captura sugerida 7:** colocar aquí el diagrama entidad-relación de MySQL o una captura del esquema de tablas.

## 11. Respuestas y errores comunes

- `200`: consulta o actualización correcta.
- `201`: registro creado.
- `204`: eliminación correcta sin cuerpo de respuesta.
- `400`: datos inválidos, credenciales incorrectas o duplicados.
- `401`: token ausente, inválido o expirado.
- `403`: el usuario autenticado no tiene rol `admin`.
- `404`: recurso no encontrado.
- `409`: relación materia-archivo duplicada.
- `422`: error de validación de Pydantic/FastAPI.

Los duplicados de correo y nombre de usuario se rechazan. Las contraseñas nunca se guardan en texto plano.

## 12. Prueba rápida con cURL

```powershell
# Iniciar sesión
curl.exe -X POST http://localhost:8000/users/login/ `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"secreto123"}'

# Promover el usuario con id 5
curl.exe -X PATCH http://localhost:8000/users/promover-admin/5 `
  -H "Authorization: Bearer <token>"
```

Para las pruebas de creación, actualización y eliminación debe utilizarse una base de datos de desarrollo o datos de prueba controlados.

## 13. Capturas recomendadas

Para mantener el documento breve, se recomiendan siete capturas como máximo:

1. Vista general de Swagger.
2. Autorización con JWT, ocultando el token.
3. Promoción de usuario a administrador.
4. Gestión de materias.
5. Subida y descarga de archivos.
6. Asociación de archivo con materia.
7. Diagrama de la base de datos.

Cada captura debe colocarse después de la sección que explica la funcionalidad correspondiente y acompañarse de una leyenda de una línea. No incluir contraseñas, tokens, claves secretas, cadenas de conexión ni datos personales reales.

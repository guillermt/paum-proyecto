# DevPaumWebapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Documentación del frontend PAUM

Frontend desarrollado con Angular 16, TypeScript y Angular Material. Permite consultar materias y archivos académicos, visualizar y descargar documentos, y administrar usuarios, materias y archivos según el rol.

### Ejecución

Requisitos: Node.js, npm y la API backend configurada en `src/environments/environment.ts`.

```bash
npm install
npm start
```

La aplicación se ejecuta en `http://localhost:4200/`.

```bash
npm run build
npm run build -- --configuration development
npm test
```

### Estructura

```text
src/app/
  layouts/       Layout de autenticación y dashboard.
  screens/       Vistas principales.
  partials/      Formularios, tablas, navbar y operaciones.
  services/      Comunicación con la API y sesión.
  guards/        Protección por autenticación y rol.
  modals/        Confirmaciones y ventanas informativas.
```

`FacadeService` administra login, logout, `/users/me/`, cookies, identidad y rol. `UsuariosService`, `MateriasService`, `ArchivosService` y `ArchivosMateriasService` encapsulan las operaciones de la API. La sesión usa un token Bearer almacenado en cookies y `RoleGuard` protege las rutas administrativas.

### Rutas y permisos

| Ruta                                   | Vista                                  | Acceso  |
| -------------------------------------- | -------------------------------------- | ------- |
| `/login`                               | Inicio de sesión                       | Público |
| `/registro-usuarios`                   | Registro de usuario                    | Público |
| `/home`                                | Inicio y materias por semestre         | Todos   |
| `/user`                                | Biblioteca con todos los archivos      | Todos   |
| `/user/:idMateria`                     | Archivos de una materia                | Todos   |
| `/visor-archivo/:idArchivo`            | Visor general                          | Todos   |
| `/visor-archivo/:idMateria/:idArchivo` | Visor desde una materia                | Todos   |
| `/registro-archivos`                   | Opciones de carga                      | Admin   |
| `/registro-archivo-singular`           | Carga individual                       | Admin   |
| `/registro-archivo-multiples`          | Carga múltiple                         | Admin   |
| `/manipulacion-archivos`               | Actualizar y eliminar archivos         | Admin   |
| `/registro-materias`                   | Registrar materias                     | Admin   |
| `/manipulacion-materias`               | Actualizar y eliminar materias         | Admin   |
| `/manipular-usuarios`                  | Administrar usuarios y promover admins | Admin   |

### Funciones por rol

- **Internauta:** consulta materias y archivos públicos, y puede visualizar documentos.
- **Estudiante:** consulta materias, visualiza archivos y puede descargarlos.
- **Administrador:** además de lo anterior, gestiona usuarios, materias y archivos.
- La promoción de un usuario existente usa `PATCH /users/promover-admin/{user_id}`; no crea un registro nuevo ni envía un email duplicado.

### Flujo de archivos

1. “Explorar archivos” abre `/user` y consulta `GET /archivos/todos-archivos`.
2. Una materia abre `/user/:idMateria` y muestra solo sus archivos asociados.
3. El visor admite archivos asociados o no asociados a una materia.
4. Al eliminar un archivo, primero se eliminan sus relaciones materia-archivo y luego el archivo principal.

### Capturas de las vistas de usuario

Guarda las imágenes en `docs/capturas/` y sustituye los nombres por las rutas reales.

1. **Login** (`/login`): formulario de acceso y enlace de registro.
   `![Inicio de sesión](docs/capturas/login.png)`
2. **Registro de usuario** (`/registro-usuarios`): nombre, correo, contraseña y confirmación. El rol no se elige en frontend; el backend asigna `estudiante`.
   `![Registro de usuario](docs/capturas/registro-usuario.png)`
3. **Inicio** (`/home`): bienvenida, resumen, botón “Explorar archivos” y materias.
   `![Inicio](docs/capturas/home.png)`
4. **Sidebar de escritorio**: Home, semestres y opciones disponibles según rol.
   `![Sidebar escritorio](docs/capturas/sidebar-escritorio.png)`
5. **Sidebar móvil**: botón burger y menú desplegado.
   `![Sidebar móvil](docs/capturas/sidebar-movil.png)`
6. **Biblioteca general** (`/user`): tabla de todos los archivos, buscador, visor y descarga.
   `![Biblioteca general](docs/capturas/biblioteca-general.png)`
7. **Archivos por materia** (`/user/:idMateria`): materia seleccionada, tabla filtrada y paginación.
   `![Archivos por materia](docs/capturas/archivos-materia.png)`
8. **Visor de archivo** (`/visor-archivo/...`): PDF, TXT, Word compatible o aviso de descarga.
   `![Visor de archivo](docs/capturas/visor-archivo.png)`

### Capturas administrativas

9. **Opciones de carga** (`/registro-archivos`): carga singular o múltiple.
   `![Opciones de carga](docs/capturas/opciones-carga.png)`
10. **Manipulación de archivos**: búsqueda, actualización y eliminación.
    `![Manipulación de archivos](docs/capturas/manipulacion-archivos.png)`
11. **Manipulación de materias**: tabla y operaciones CRUD.
    `![Manipulación de materias](docs/capturas/manipulacion-materias.png)`
12. **Manipulación de usuarios**: actualización, eliminación y promoción a administrador.
    `![Manipulación de usuarios](docs/capturas/manipulacion-usuarios.png)`

### Consideraciones

- Las URLs de la API se configuran en `src/environments/`.
- Las rutas administrativas requieren un token válido y rol `admin` en el backend.
- Para probar la promoción debe existir un administrador autenticado.

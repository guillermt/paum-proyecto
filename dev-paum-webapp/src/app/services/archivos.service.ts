import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ArchivosMateriasService } from './archivos-materias.service';

export interface ArchivoRegistro {
  nombre?: string;
  descripcion?: string;
  archivo: File;
}

export interface ArchivoActualizacion {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Archivo {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  mime_type?: string;
  fecha_subida?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  private readonly endpoint = `${environment.url_api}/archivos/registrar-archivo`;
  private readonly endpointDescarga = `${environment.url_api}/archivos/descargar-archivo`;
  private readonly descripcionPorDefecto = 'archivos subidos en segmento';

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private archivosMateriasService: ArchivosMateriasService
  ) { }

  // FormData permite que el navegador establezca correctamente el boundary multipart.
  public registrarArchivo(datos: ArchivoRegistro): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', datos.nombre?.trim() || datos.archivo.name);
    formData.append('descripcion', (datos.descripcion ?? '').trim() || this.descripcionPorDefecto);
    formData.append('archivo', datos.archivo, datos.archivo.name);

    return this.http.post<any>(this.endpoint, formData, {
      headers: this.authorizationHeaders()
    });
  }

  // El endpoint recibe un archivo por petición; se agrupan las respuestas de la carga múltiple.
  public registrarArchivos(nombre: string, archivos: File[]): Observable<any[]> {
    const solicitudes = archivos.map((archivo) => this.registrarArchivo({
      nombre,
      archivo
    }));

    return forkJoin(solicitudes);
  }

  public descargarArchivo(archivoId: number): Observable<Blob> {
    return this.http.get(`${this.endpointDescarga}/${archivoId}`, {
      headers: this.authorizationHeaders(),
      responseType: 'blob'
    });
  }

  public obtenerTodosLosArchivos(skip = 0, limit = 100): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${environment.url_api}/archivos/todos-archivos`, {
      headers: this.authorizationHeaders(),
      params: { skip, limit }
    });
  }

  public actualizarArchivo(datos: ArchivoActualizacion): Observable<any> {
    return this.http.put<any>(`${environment.url_api}/archivos/actualizar-archivo/${datos.id}`, {
      nombre: datos.nombre,
      descripcion: datos.descripcion
    }, { headers: this.authorizationHeaders() });
  }

  public eliminarArchivo(archivoId: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_api}/archivos/eliminar-archivo/${archivoId}`, {
      headers: this.authorizationHeaders()
    });
  }

  public eliminarArchivoYRelaciones(archivoId: number, materiaIds: number[]): Observable<any> {
    const relaciones = materiaIds.map((materiaId) =>
      this.archivosMateriasService.eliminarRelacion(materiaId, archivoId)
    );

    return forkJoin(relaciones.length ? relaciones : [of(null)]).pipe(
      switchMap(() => this.eliminarArchivo(archivoId))
    );
  }

  private authorizationHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}

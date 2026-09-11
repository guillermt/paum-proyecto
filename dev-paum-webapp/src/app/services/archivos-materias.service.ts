import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { Archivo } from './archivos.service';

export interface ArchivoMateriaRelacion {
  materia_id: number;
  archivo_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArchivosMateriasService {
  private readonly endpoint = `${environment.url_api}/archivos-materias/registrar-relacion`;
  private readonly endpointArchivos = `${environment.url_api}/archivos-materias/obtener-archivos`;

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) { }

  public registrarRelacion(materiaId: number, archivoId: number): Observable<any> {
    const payload: ArchivoMateriaRelacion = {
      materia_id: materiaId,
      archivo_id: archivoId
    };

    return this.http.post<any>(this.endpoint, payload, {
      headers: this.authorizationHeaders()
    });
  }

  public obtenerArchivosPorMateria(materiaId: number): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.endpointArchivos}/${materiaId}`, {
      headers: this.authorizationHeaders()
    });
  }

  public eliminarRelacion(materiaId: number, archivoId: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_api}/archivos-materias/eliminar-relacion/${materiaId}/${archivoId}`, {
      headers: this.authorizationHeaders()
    });
  }

  private authorizationHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}

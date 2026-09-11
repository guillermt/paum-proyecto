import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

export interface MateriaRegistro {
  nombre: string;
  semestre: number;
}

export interface Materia {
  id: number;
  nombre: string;
  semestre: number;
}

@Injectable({
  providedIn: 'root'
})
export class MateriasService {
  private readonly endpoint = `${environment.url_api}/materias/registrar-materia`;
  private readonly endpointLista = `${environment.url_api}/materias/todos-materias`;
  private readonly endpointPorSemestre = `${environment.url_api}/materias/obtener-materias-semestre`;

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) { }

  public registrarMateria(datos: MateriaRegistro): Observable<any> {
    return this.http.post<any>(this.endpoint, datos, {
      headers: this.authorizationHeaders()
    });
  }

  public obtenerMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.endpointLista, {
      headers: this.authorizationHeaders()
    });
  }

  public obtenerMateriasPorSemestre(semestre: number): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.endpointPorSemestre}/${semestre}`, {
      headers: this.authorizationHeaders()
    });
  }

  public actualizarMateria(materia: MateriaRegistro & { id: number }): Observable<any> {
    return this.http.put<any>(`${environment.url_api}/materias/actualizar-materia/${materia.id}`, {
      nombre: materia.nombre,
      semestre: materia.semestre
    }, { headers: this.authorizationHeaders() });
  }

  public eliminarMateria(materiaId: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_api}/materias/eliminar-materia/${materiaId}`, {
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

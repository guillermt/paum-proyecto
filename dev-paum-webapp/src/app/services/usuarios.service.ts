import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  // Esquema para un nuevo usuario (valores por defecto)
  public esquemaUsuario(){
    return {
      'nombre_usuario': '',
      'email': '',
      'contraseña': '',
      'confirmar_contraseña': ''
    }
  }

  // Validación para el formulario de usuario
  public validarUsuario(data: any, editar: boolean){
    console.log("Validando usuario... ", data);
    let error: any = {};

    // Nombre de usuario
    if(!this.validatorService.required(data["nombre_usuario"])){
      error["nombre_usuario"] = this.errorService.required;
    } else if(!this.validatorService.max(data["nombre_usuario"], 100)){
      error["nombre_usuario"] = this.errorService.max(100);
    }

    // Email
    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    } else if(!this.validatorService.max(data["email"], 100)){
      error["email"] = this.errorService.max(100);
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    // Contraseña (solo si no se está editando, o si se envía nueva)
    if(!editar){
      if(!this.validatorService.required(data["contraseña"])){
        error["contraseña"] = this.errorService.required;
      } else if(!this.validatorService.min(data["contraseña"], 6)){
        error["contraseña"] = "La contraseña debe tener al menos 6 caracteres.";
      }
      // Confirmar contraseña se valida en el componente (comparación)
      if(!this.validatorService.required(data["confirmar_contraseña"])){
        error["confirmar_contraseña"] = this.errorService.required;
      }
    } else {
      // Si se está editando y se envía contraseña, validamos
      if(data["contraseña"] && data["contraseña"].length > 0){
        if(!this.validatorService.min(data["contraseña"], 6)){
          error["contraseña"] = "La contraseña debe tener al menos 6 caracteres.";
        }
        if(!this.validatorService.required(data["confirmar_contraseña"])){
          error["confirmar_contraseña"] = this.errorService.required;
        }
      }
    }

    return error;
  }

  // =================== SERVICIOS HTTP ===================

  // Registrar un nuevo usuario
  public registrarUsuario(data: any): Observable<any> {
    // Verificamos si existe el token de sesión (para admin)
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    // Construir payload (sin confirmar_contraseña)
    const payload = {
      nombre_usuario: data.nombre_usuario,
      email: data.email,
      contraseña: data.contraseña
    };

    return this.http.post<any>(`${environment.url_api}/users/crear-usuario`, payload, { headers });
  }

  public promoverAdministrador(usuarioId: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    });

    return this.http.patch<any>(`${environment.url_api}/users/promover-admin/${usuarioId}`, {}, { headers });
  }

  // Obtener lista de usuarios (solo admin)
  public obtenerListaUsuarios(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/users/todos-usuarios`, { headers });
  }

  // Obtener un usuario por ID (solo admin)
  public obtenerUsuarioPorID(idUsuario: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/users/obtener-usuario/${idUsuario}`, { headers });
  }

  // Actualizar usuario (solo admin)
  public actualizarUsuario(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    // Construir payload: solo campos que pueden actualizarse
    const payload: any = {
      nombre_usuario: data.nombre_usuario,
      email: data.email
    };
    // Si se envía nueva contraseña, la incluimos
    if (data.contraseña && data.contraseña.length > 0) {
      payload.contraseña = data.contraseña;
    }

    return this.http.put<any>(`${environment.url_api}/users/actualizar-usuario/${data.id}`, payload, { headers });
  }

  // Eliminar usuario (solo admin)
  public eliminarUsuario(idUsuario: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/users/eliminar-usuario/${idUsuario}`, { headers });
  }
}

import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable, Subject } from 'rxjs';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

//Estas son variables para las cookies
const session_cookie_name = 'dev-paum-token';
const user_email_cookie_name = 'dev-paum-email';
const user_id_cookie_name = 'dev-paum-user_id';
const user_complete_name_cookie_name = 'dev-paum-user_complete_name';
const group_name_cookie_name = 'dev-paum-group_name';
const codigo_cookie_name = 'dev-paum-codigo';


@Injectable({
  providedIn: 'root'
})
export class FacadeService {
  private readonly identityChanged = new Subject<string>();
  readonly identityChanged$ = this.identityChanged.asObservable();

  constructor(
    private http: HttpClient,
    public router: Router,
    @Inject(CookieService) private cookieService: CookieService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
  ) { }

   //Funcion para validar login
  public validarLogin(username: String, password: String){
    let data = {
      "username": username,
      "password": password
    };
    console.log("Valindando login con datos: ", data);
    let error: any = {};

    if(!this.validatorService.required(data["username"])){
      error["username"] = this.errorService.required;
    }else if(!this.validatorService.max(data["username"], 40)){
      error["username"] = this.errorService.max(40);
    }else if (!this.validatorService.email(data['username'])) {
      error['username'] = this.errorService.email;
    }

    if(!this.validatorService.required(data["password"])){
      error["password"] = this.errorService.required;
    }

    return error;

  }

  // Funciones básicas
  //Iniciar sesión
  public login(username: string, password: string): Observable<any> {
  const data = { username, password };
  return this.http.post<any>(`${environment.url_api}/users/login/`, data);
 }

  //Cerrar sesión
  public logout(): Observable<any> {
    let headers: any;
    let token = this.getSessionToken();
    headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.post<any>(`${environment.url_api}/users/logout/`, {}, { headers: headers });
  }

  // Funciones para utilizar las cookies en web
  retrieveSignedUser(){
    var headers: any;
    var token = this.getSessionToken();
    headers = new HttpHeaders({'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/users/me/`, {headers: headers});
  }

  getCookieValue(key:string){
    return this.cookieService.get(key);
  }

  saveCookieValue(key:string, value:string){
    var secure = environment.url_api.indexOf("https")!=-1;
    this.cookieService.set(key, value, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
  }

  saveUserData(user_data: any): boolean {
    var secure = environment.url_api.indexOf("https") !== -1;
    // Soporta respuesta plana o anidada en 'user'
    const user = user_data.user || user_data;
    const token = user_data.token || user_data.access || user_data.access_token;
    let id = user.id;
    let email = user.email;
    let name = user.nombre_usuario || email || '';
    if (!token) {
      return false;
    }
    this.cookieService.set(user_id_cookie_name, id, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_email_cookie_name, email, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_complete_name_cookie_name, name, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(session_cookie_name, token, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(group_name_cookie_name, user_data.rol || user.rol || user.group_name || '', undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.identityChanged.next(name);
    return true;
  }

  saveUserIdentity(user_data: any): void {
    const user = user_data?.user || user_data || {};
    const name = user.nombre_usuario || user.email || '';

    if (user.id !== undefined && user.id !== null) {
      this.saveCookieValue(user_id_cookie_name, String(user.id));
    }
    if (user.email) {
      this.saveCookieValue(user_email_cookie_name, String(user.email));
    }
    if (name) {
      this.saveCookieValue(user_complete_name_cookie_name, name);
    }
    if (user.rol || user.group_name) {
      this.saveCookieValue(group_name_cookie_name, String(user.rol || user.group_name));
    }
    this.identityChanged.next(name);
  }

  destroyUser(){
    this.cookieService.deleteAll();
    this.identityChanged.next('');
  }

  getSessionToken(){
    return this.cookieService.get(session_cookie_name);
  }

  getUserEmail(){
    return this.cookieService.get(user_email_cookie_name);
  }

  getUserCompleteName(){
    return this.cookieService.get(user_complete_name_cookie_name);
  }

  getUserId(){
    return this.cookieService.get(user_id_cookie_name);
  }

  getUserGroup(){
    return this.cookieService.get(group_name_cookie_name);
  }
}

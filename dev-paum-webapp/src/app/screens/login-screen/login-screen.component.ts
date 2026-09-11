import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent {

   //Variables para la vista
  public username:string = "";
  public password:string = "";
  public type: string = "password";
  public errors:any = {};
  public load:boolean = false;

   constructor(
    public router: Router,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {

  }

  public login(){
    // Validar credenciales y que los campos no estén vacíos
    this.errors = {};
    this.errors = this.facadeService.validarLogin(this.username, this.password);
    if(Object.keys(this.errors).length > 0){
      return;
    }
    this.load = true;
    // Llamar al servicio de login
    this.facadeService.login(this.username, this.password).subscribe(
      (response:any) => {
        // Guardar el token en el almacenamiento local - las cookies
        if (!this.facadeService.saveUserData(response)) {
          this.load = false;
          this.errors.general = 'La respuesta de inicio de sesión no contiene un token válido.';
          return;
        }

        this.facadeService.retrieveSignedUser().subscribe({
          next: (user) => {
            this.facadeService.saveUserIdentity(user);
            this.router.navigate(['/home']);
            this.load = false;
          },
          error: () => {
            this.router.navigate(['/home']);
            this.load = false;
          }
        });
      },
      (error:any) => {
        this.load = false;
        // Mostrar mensaje de error
        alert("Error en el login: " + error.message);
        this.errors.general = "Credenciales inválidas. Por favor, inténtalo de nuevo.";
      }
    );

  }

  //Metodo para mostrar/ocultar la contraseña
  //Opción 1: Cambiar el tipo de input de password a text
  showHidePassword():void{
    if(this.type == "password"){
      this.type = "text";
    }else{
      this.type = "password";
    }
  }

  //Opción 2: Cambiar el icono de ojo abierto/cerrado
  public showPassword(){
    this.type = this.type === "password" ? "text" : "password";
  }

  public registrar(){
    this.router.navigate(["registro-usuarios"]);
  }

}

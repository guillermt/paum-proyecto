import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-registro-usuarios',
  templateUrl: './registro-usuarios.component.html',
  styleUrls: ['./registro-usuarios.component.scss']
})
export class RegistroUsuariosComponent implements OnInit {

  @Input() datos_user: any = {};

  public usuario: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      if (this.datos_user && Object.keys(this.datos_user).length > 0) {
        this.usuario = { ...this.datos_user };
        this.usuario.contraseña = '';
        this.usuario.confirmar_contraseña = '';
      } else {
        this.cargarUsuario(this.idUser);
      }
    } else {
      this.usuario = this.usuariosService.esquemaUsuario();
      this.token = this.facadeService.getSessionToken();
    }
    console.log('Usuario: ', this.usuario);
  }

  cargarUsuario(id: any) {
    this.usuariosService.obtenerUsuarioPorID(id).subscribe(
      (data) => {
        this.usuario = data;
        this.usuario.contraseña = '';
        this.usuario.confirmar_contraseña = '';
      },
      (error) => console.error('Error al cargar usuario', error)
    );
  }

  public showPassword() {
    this.inputType_1 = this.inputType_1 === 'password' ? 'text' : 'password';
    this.hide_1 = !this.hide_1;
  }

  public showPwdConfirmar() {
    this.inputType_2 = this.inputType_2 === 'password' ? 'text' : 'password';
    this.hide_2 = !this.hide_2;
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = {};
    this.errors = this.usuariosService.validarUsuario(this.usuario, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return;
    }
    if (this.usuario.contraseña !== this.usuario.confirmar_contraseña) {
      alert('Las contraseñas no coinciden');
      this.usuario.contraseña = '';
      this.usuario.confirmar_contraseña = '';
      return;
    }

    this.usuariosService.registrarUsuario(this.usuario).subscribe(
      (response) => {
        alert('Usuario registrado exitosamente');
        console.log('Usuario registrado: ', response);
        if (this.token && this.token !== '') {
          this.router.navigate(['administrador']);
        } else {
          this.router.navigate(['/']);
        }
      },
      (error) => {
        alert('Error al registrar usuario: ' + (error.error?.detail || error.message));
        console.error('Error al registrar usuario: ', error);
      }
    );
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.usuariosService.validarUsuario(this.usuario, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return;
    }
    if (this.usuario.contraseña && this.usuario.contraseña !== this.usuario.confirmar_contraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.usuariosService.actualizarUsuario(this.usuario).subscribe(
      (response) => {
        alert('Usuario actualizado exitosamente');
        console.log('Usuario actualizado: ', response);
        this.router.navigate(['administrador']);
      },
      (error) => {
        alert('Error al actualizar usuario: ' + (error.error?.detail || error.message));
        console.error('Error al actualizar usuario: ', error);
      }
    );
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  public togglePassword(id: '1' | '2') {
  if (id === '1') {
    this.inputType_1 = this.inputType_1 === 'password' ? 'text' : 'password';
    this.hide_1 = !this.hide_1;
  } else {
    this.inputType_2 = this.inputType_2 === 'password' ? 'text' : 'password';
    this.hide_2 = !this.hide_2;
  }
}
}

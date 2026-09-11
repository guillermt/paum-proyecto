import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UsuariosService } from '../../services/usuarios.service';

interface UsuarioAdministrable {
  id: number;
  nombre_usuario: string;
  email: string;
  rol: string;
}

@Component({
  selector: 'app-manipular-usuarios',
  templateUrl: './manipular-usuarios.component.html',
  styleUrls: ['./manipular-usuarios.component.scss']
})
export class ManipularUsuariosComponent implements OnInit {
  displayedColumns = ['nombre_usuario', 'email', 'rol', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioAdministrable>([]);
  cargando = true;
  errorMessage = '';
  successMessage = '';
  mostrarFormulario = false;
  mostrarFormularioAdmin = false;
  mostrarActualizar = false;
  mostrarEliminar = false;
  usuarioSeleccionado?: UsuarioAdministrable;
  formularioUsuario = {
    nombre_usuario: '',
    email: '',
    contraseña: ''
  };
  datosPendientes?: typeof this.formularioUsuario;

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.errorMessage = '';
    this.usuariosService.obtenerListaUsuarios().subscribe({
      next: (respuesta) => {
        const usuarios = Array.isArray(respuesta) ? respuesta : (respuesta?.users || respuesta?.usuarios || []);
        this.dataSource.data = usuarios.filter((usuario: UsuarioAdministrable) => {
          const rol = (usuario.rol || '').toLowerCase();
          return rol !== 'admin' && rol !== 'administrador';
        });
        this.cargando = false;
      },
      error: () => this.mostrarError('No fue posible obtener los usuarios.')
    });
  }

  aplicarFiltro(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  iniciarActualizar(usuario: UsuarioAdministrable): void {
    this.usuarioSeleccionado = usuario;
    this.formularioUsuario = {
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email,
      contraseña: ''
    };
    this.mostrarFormulario = true;
  }

  actualizar(datos: typeof this.formularioUsuario): void {
    if (!this.usuarioSeleccionado) {
      return;
    }
    this.datosPendientes = { ...datos };
    this.mostrarFormulario = false;
    this.mostrarActualizar = true;
  }

  confirmarActualizar(): void {
    if (!this.usuarioSeleccionado || !this.datosPendientes) {
      return;
    }
    const datos = this.datosPendientes;
    this.mostrarActualizar = false;
    this.usuariosService.actualizarUsuario({
      id: this.usuarioSeleccionado.id,
      nombre_usuario: datos.nombre_usuario,
      email: datos.email,
      contraseña: datos.contraseña
    }).subscribe({
      next: () => this.finalizarOperacion('Usuario actualizado correctamente.'),
      error: () => this.mostrarError('No fue posible actualizar el usuario.')
    });
  }

  iniciarCrearAdministrador(usuario: UsuarioAdministrable): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarFormulario = false;
    this.mostrarFormularioAdmin = true;
  }

  crearAdministrador(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    this.usuariosService.promoverAdministrador(this.usuarioSeleccionado.id).subscribe({
      next: () => this.finalizarOperacion('Administrador creado correctamente.'),
      error: (error) => {
        if (error.status === 403) {
          this.mostrarError('El usuario de la sesión no tiene rol admin en el backend. Cierra sesión e inicia con un administrador existente.');
          return;
        }
        this.mostrarError(error.error?.detail || 'No fue posible crear el administrador.');
      }
    });
  }

  iniciarEliminar(usuario: UsuarioAdministrable): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarEliminar = true;
  }

  confirmarEliminar(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }
    const usuarioId = this.usuarioSeleccionado.id;
    this.mostrarEliminar = false;
    this.usuariosService.eliminarUsuario(usuarioId).subscribe({
      next: () => this.finalizarOperacion('Usuario eliminado correctamente.'),
      error: () => this.mostrarError('No fue posible eliminar el usuario.')
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.mostrarFormularioAdmin = false;
    this.mostrarActualizar = false;
    this.mostrarEliminar = false;
    this.datosPendientes = undefined;
  }

  private finalizarOperacion(mensaje: string): void {
    this.mostrarFormulario = false;
    this.mostrarFormularioAdmin = false;
    this.mostrarActualizar = false;
    this.usuarioSeleccionado = undefined;
    this.datosPendientes = undefined;
    this.successMessage = mensaje;
    this.errorMessage = '';
    this.cargarUsuarios();
  }

  private mostrarError(mensaje: string): void {
    this.errorMessage = mensaje;
    this.cargando = false;
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { Archivo, ArchivosService } from '../../services/archivos.service';
import { ArchivosMateriasService } from '../../services/archivos-materias.service';
import { Materia, MateriasService } from '../../services/materias.service';
import { DatosCambio } from '../formulario-cambios/formulario-cambios.component';

interface ArchivoAdministrable extends Archivo {
  materiaIds: number[];
}

@Component({
  selector: 'app-manipulacion-archivos',
  templateUrl: './manipulacion-archivos.component.html',
  styleUrls: ['./manipulacion-archivos.component.scss']
})
export class ManipulacionArchivosComponent implements OnInit {
  displayedColumns = ['nombre', 'descripcion', 'acciones'];
  dataSource = new MatTableDataSource<ArchivoAdministrable>([]);
  cargando = true;
  errorMessage = '';
  successMessage = '';
  mostrarFormulario = false;
  mostrarActualizar = false;
  mostrarEliminar = false;
  archivoSeleccionado?: ArchivoAdministrable;
  datosPendientes?: DatosCambio;

  constructor(
    private archivosService: ArchivosService,
    private archivosMateriasService: ArchivosMateriasService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    this.cargarArchivos();
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  cargarArchivos(): void {
    this.cargando = true;
    this.materiasService.obtenerMaterias().subscribe({
      next: (materias) => {
        const solicitudes = (materias || []).map((materia) =>
          this.archivosMateriasService.obtenerArchivosPorMateria(materia.id));
        forkJoin(solicitudes).subscribe({
          next: (listas) => {
            const archivos = new Map<number, ArchivoAdministrable>();
            (listas || []).forEach((lista, index) => {
              (lista || []).forEach((archivo) => {
                const existente = archivos.get(archivo.id);
                archivos.set(archivo.id, {
                  ...archivo,
                  materiaIds: [...new Set([...(existente?.materiaIds || []), materias[index].id])]
                });
              });
            });
            this.dataSource.data = Array.from(archivos.values());
            this.cargando = false;
          },
          error: () => this.mostrarError('No fue posible obtener los archivos.')
        });
      },
      error: () => this.mostrarError('No fue posible obtener las materias relacionadas.')
    });
  }

  aplicarFiltro(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  iniciarActualizar(archivo: ArchivoAdministrable): void {
    this.archivoSeleccionado = archivo;
    this.mostrarFormulario = true;
  }

  actualizar(datos: DatosCambio): void {
    if (!this.archivoSeleccionado || datos.descripcion === undefined) {
      return;
    }
    this.datosPendientes = datos;
    this.mostrarFormulario = false;
    this.mostrarActualizar = true;
  }

  confirmarActualizar(): void {
    if (!this.archivoSeleccionado || !this.datosPendientes || this.datosPendientes.descripcion === undefined) {
      return;
    }
    const datos = this.datosPendientes;
    this.mostrarActualizar = false;

    this.archivosService.actualizarArchivo({
      id: this.archivoSeleccionado.id,
      nombre: datos.nombre,
      descripcion: datos.descripcion as string
    }).subscribe({
      next: () => this.finalizarOperacion('Archivo actualizado correctamente.'),
      error: () => this.mostrarError('No fue posible actualizar el archivo.')
    });
  }

  iniciarEliminar(archivo: ArchivoAdministrable): void {
    this.archivoSeleccionado = archivo;
    this.mostrarEliminar = true;
  }

  confirmarEliminar(): void {
    if (!this.archivoSeleccionado) {
      return;
    }
    const archivo = this.archivoSeleccionado;
    this.mostrarEliminar = false;
    this.archivosService.eliminarArchivoYRelaciones(archivo.id, archivo.materiaIds).subscribe({
      next: () => this.finalizarOperacion('Archivo eliminado correctamente.'),
      error: () => this.mostrarError('No fue posible eliminar el archivo y sus relaciones.')
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.mostrarActualizar = false;
    this.mostrarEliminar = false;
    this.datosPendientes = undefined;
  }

  private finalizarOperacion(mensaje: string): void {
    this.mostrarFormulario = false;
    this.mostrarActualizar = false;
    this.archivoSeleccionado = undefined;
    this.datosPendientes = undefined;
    this.successMessage = mensaje;
    this.errorMessage = '';
    this.cargarArchivos();
  }

  private mostrarError(mensaje: string): void {
    this.errorMessage = mensaje;
    this.cargando = false;
  }

}

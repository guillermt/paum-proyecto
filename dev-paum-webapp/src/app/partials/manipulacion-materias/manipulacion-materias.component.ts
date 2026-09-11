import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Observable } from 'rxjs';
import { ArchivosMateriasService } from '../../services/archivos-materias.service';
import { Materia, MateriasService } from '../../services/materias.service';
import { DatosCambio } from '../formulario-cambios/formulario-cambios.component';

@Component({
  selector: 'app-manipulacion-materias',
  templateUrl: './manipulacion-materias.component.html',
  styleUrls: ['./manipulacion-materias.component.scss']
})
export class ManipulacionMateriasComponent implements OnInit {
  displayedColumns = ['nombre', 'semestre', 'acciones'];
  dataSource = new MatTableDataSource<Materia>([]);
  cargando = true;
  errorMessage = '';
  successMessage = '';
  mostrarFormulario = false;
  mostrarActualizar = false;
  mostrarEliminar = false;
  materiaSeleccionada?: Materia;
  datosPendientes?: DatosCambio;

  constructor(
    private materiasService: MateriasService,
    private archivosMateriasService: ArchivosMateriasService
  ) { }

  ngOnInit(): void {
    this.cargarMaterias();
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  cargarMaterias(): void {
    this.cargando = true;
    this.materiasService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.dataSource.data = Array.isArray(materias) ? materias : [];
        this.cargando = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible obtener las materias.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  iniciarActualizar(materia: Materia): void {
    this.materiaSeleccionada = materia;
    this.mostrarFormulario = true;
  }

  actualizar(datos: DatosCambio): void {
    if (!this.materiaSeleccionada || datos.semestre === undefined) {
      return;
    }

    this.datosPendientes = datos;
    this.mostrarFormulario = false;
    this.mostrarActualizar = true;
  }

  confirmarActualizar(): void {
    if (!this.materiaSeleccionada || !this.datosPendientes || this.datosPendientes.semestre === undefined) {
      return;
    }

    const datos = this.datosPendientes;
    this.mostrarActualizar = false;

    this.materiasService.actualizarMateria({
      id: this.materiaSeleccionada.id,
      nombre: datos.nombre,
      semestre: datos.semestre as number
    }).subscribe({
      next: () => this.finalizarOperacion('Materia actualizada correctamente.'),
      error: () => this.errorMessage = 'No fue posible actualizar la materia.'
    });
  }

  iniciarEliminar(materia: Materia): void {
    this.materiaSeleccionada = materia;
    this.mostrarEliminar = true;
  }

  confirmarEliminar(): void {
    if (!this.materiaSeleccionada) {
      return;
    }

    const materiaId = this.materiaSeleccionada.id;
    this.mostrarEliminar = false;
    this.archivosMateriasService.obtenerArchivosPorMateria(materiaId).subscribe({
      next: (archivos) => {
        const relaciones: Observable<any>[] = (archivos || []).map((archivo) =>
          this.archivosMateriasService.eliminarRelacion(materiaId, archivo.id));
        forkJoin(relaciones).subscribe({
          next: () => this.eliminarMateria(materiaId),
          error: () => this.errorMessage = 'No fue posible eliminar las relaciones de la materia.'
        });
      },
      error: () => this.errorMessage = 'No fue posible obtener las relaciones de la materia.'
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.mostrarActualizar = false;
    this.mostrarEliminar = false;
    this.datosPendientes = undefined;
  }

  private eliminarMateria(materiaId: number): void {
    this.materiasService.eliminarMateria(materiaId).subscribe({
      next: () => this.finalizarOperacion('Materia eliminada correctamente.'),
      error: () => this.errorMessage = 'No fue posible eliminar la materia.'
    });
  }

  private finalizarOperacion(mensaje: string): void {
    this.mostrarFormulario = false;
    this.mostrarActualizar = false;
    this.materiaSeleccionada = undefined;
    this.datosPendientes = undefined;
    this.successMessage = mensaje;
    this.errorMessage = '';
    this.cargarMaterias();
  }

}

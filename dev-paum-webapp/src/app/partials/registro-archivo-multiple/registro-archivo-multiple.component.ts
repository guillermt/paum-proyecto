import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ArchivosMateriasService } from '../../services/archivos-materias.service';
import { ArchivosService } from '../../services/archivos.service';
import { Materia, MateriasService } from '../../services/materias.service';

@Component({
  selector: 'app-registro-archivo-multiple',
  templateUrl: './registro-archivo-multiple.component.html',
  styleUrls: ['./registro-archivo-multiple.component.scss']
})
export class RegistroArchivoMultipleComponent {
  private readonly extensionesPermitidas = ['pdf', 'doc', 'docx', 'txt'];
  nombre = '';
  descripcion = '';
  archivos: File[] = [];
  materias: Materia[] = [];
  selectedMateriaId: number | null = null;
  fileError = '';
  materiaError = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private archivosService: ArchivosService,
    private materiasService: MateriasService,
    private archivosMateriasService: ArchivosMateriasService
  ) {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.materiasService.obtenerMaterias().subscribe({
      next: (res) => this.materias = Array.isArray(res) ? res : [],
      error: () => {
        this.materias = [];
        this.errorMessage = 'No fue posible cargar las materias.';
      }
    });
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivos = Array.from(input.files ?? []);
    this.fileError = this.validarArchivos();
  }

  submit(form: NgForm): void {
    if (form.invalid || !this.archivos.length) {
      this.fileError = this.validarArchivos();
      this.materiaError = this.selectedMateriaId ? '' : 'Debe seleccionar una materia.';
      return;
    }

    this.fileError = this.validarArchivos();
    if (this.fileError || !this.selectedMateriaId) {
      this.materiaError = this.selectedMateriaId ? '' : 'Debe seleccionar una materia.';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.archivosService.registrarArchivos(this.nombre, this.archivos).subscribe({
      next: (respuestas) => {
        const relaciones = respuestas.map((respuesta) => {
          const archivoId = respuesta?.id ?? respuesta?.archivo?.id ?? respuesta?.data?.id;
          return archivoId
            ? this.archivosMateriasService.registrarRelacion(this.selectedMateriaId as number, archivoId)
            : null;
        });

        if (relaciones.some((relacion) => !relacion)) {
          this.errorMessage = 'Los archivos se registraron, pero no se pudieron relacionar con la materia.';
          return;
        }

        forkJoin(relaciones).subscribe({
          next: () => this.successMessage = 'Archivos y relaciones con la materia registrados correctamente.',
          error: () => this.errorMessage = 'Los archivos se registraron, pero no fue posible relacionarlos con la materia.'
        });
      },
      error: () => this.errorMessage = 'No fue posible registrar los archivos. Inténtalo de nuevo.'
    });
  }

  private validarArchivos(): string {
    if (!this.archivos.length) {
      return 'Debe seleccionar al menos un archivo.';
    }

    const archivoNoPermitido = this.archivos.find((archivo) => {
      const extension = archivo.name.split('.').pop()?.toLowerCase();
      return !extension || !this.extensionesPermitidas.includes(extension);
    });

    return archivoNoPermitido
      ? `El archivo "${archivoNoPermitido.name}" no tiene un formato permitido. Solo se permiten PDF, DOC, DOCX o TXT.`
      : '';
  }

}

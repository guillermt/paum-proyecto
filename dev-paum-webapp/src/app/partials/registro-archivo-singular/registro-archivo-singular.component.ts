import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ArchivosMateriasService } from '../../services/archivos-materias.service';
import { ArchivosService } from '../../services/archivos.service';
import { Materia, MateriasService } from '../../services/materias.service';

@Component({
  selector: 'app-registro-archivo-singular',
  templateUrl: './registro-archivo-singular.component.html',
  styleUrls: ['./registro-archivo-singular.component.scss']
})
export class RegistroArchivoSingularComponent implements OnInit {
  private readonly extensionesPermitidas = ['pdf', 'doc', 'docx', 'txt'];
  nombre = '';
  descripcion = '';
  archivo: File | null = null;
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
  ) { }

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.materiasService.obtenerMaterias().subscribe({
      next: (res) => {
        this.materias = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.materias = [];
        this.errorMessage = 'No fue posible cargar las materias.';
      }
    });
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
    this.fileError = this.validarArchivo(this.archivo);
  }

  submit(form: NgForm): void {
    this.fileError = '';
    this.materiaError = '';
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.selectedMateriaId) {
      this.materiaError = 'Debe seleccionar una materia.';
    }

    if (form.invalid || !this.archivo || this.validarArchivo(this.archivo)) {
      this.fileError = this.validarArchivo(this.archivo);
      return;
    }

    if (!this.descripcion.trim()) {
      this.errorMessage = 'La descripción es obligatoria.';
      return;
    }

    if (this.materiaError) {
      return;
    }

    this.archivosService.registrarArchivo({
      nombre: this.nombre,
      descripcion: this.descripcion,
      archivo: this.archivo
    }).subscribe({
      next: (respuesta) => {
        const archivoId = respuesta?.id ?? respuesta?.archivo?.id ?? respuesta?.data?.id;

        if (!archivoId) {
          this.errorMessage = 'El archivo se registró, pero no se pudo obtener su identificador para relacionarlo con la materia.';
          return;
        }

        this.archivosMateriasService.registrarRelacion(this.selectedMateriaId as number, archivoId).subscribe({
          next: () => {
            this.successMessage = 'Archivo y relación con la materia registrados correctamente.';
            this.nombre = '';
            this.descripcion = '';
            this.archivo = null;
            this.selectedMateriaId = null;
            form.resetForm();
          },
          error: () => {
            this.errorMessage = 'El archivo se registró, pero no fue posible relacionarlo con la materia.';
          }
        });
      },
      error: () => this.errorMessage = 'No fue posible registrar el archivo. Inténtalo de nuevo.'
    });
  }

  private validarArchivo(archivo: File | null): string {
    if (!archivo) {
      return 'Debe seleccionar un archivo.';
    }

    const extension = archivo.name.split('.').pop()?.toLowerCase();
    return extension && this.extensionesPermitidas.includes(extension)
      ? ''
      : 'Solo se permiten archivos PDF, DOC, DOCX o TXT.';
  }

}

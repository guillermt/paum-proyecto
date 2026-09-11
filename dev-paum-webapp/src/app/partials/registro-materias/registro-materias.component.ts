import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MateriasService } from '../../services/materias.service';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent {
  nombre = '';
  semestre: number | null = null;
  nombreError = '';
  semestreError = '';
  successMessage = '';
  errorMessage = '';

  constructor(private materiasService: MateriasService) { }

  submit(form: NgForm): void {
    this.nombreError = '';
    this.semestreError = '';
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.nombre.trim()) {
      this.nombreError = 'El nombre de la materia es obligatorio.';
    }

    if (this.semestre === null || this.semestre < 1 || this.semestre > 12 || !Number.isInteger(this.semestre)) {
      this.semestreError = 'El semestre debe ser un número entre 1 y 12.';
    }

    if (form.invalid || this.nombreError || this.semestreError) {
      return;
    }

    this.materiasService.registrarMateria({
      nombre: this.nombre.trim(),
      semestre: this.semestre as number
    }).subscribe({
      next: () => {
        this.successMessage = 'Materia registrada correctamente.';
        this.nombre = '';
        this.semestre = null;
        form.resetForm();
      },
      error: () => {
        this.errorMessage = 'No fue posible registrar la materia. Inténtalo de nuevo.';
      }
    });
  }
}

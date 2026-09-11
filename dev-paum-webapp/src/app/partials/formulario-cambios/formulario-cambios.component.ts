import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TipoCambio = 'materia' | 'archivo';

export interface DatosCambio {
  nombre: string;
  semestre?: number;
  descripcion?: string;
}

@Component({
  selector: 'app-formulario-cambios',
  templateUrl: './formulario-cambios.component.html',
  styleUrls: ['./formulario-cambios.component.scss']
})
export class FormularioCambiosComponent {
  @Input() tipo: TipoCambio = 'materia';
  @Input() nombre = '';
  @Input() semestre: number | null = null;
  @Input() descripcion = '';
  @Output() guardar = new EventEmitter<DatosCambio>();
  @Output() cancelar = new EventEmitter<void>();

  nombreError = '';
  semestreError = '';
  descripcionError = '';

  submit(): void {
    this.nombreError = this.nombre.trim() ? '' : 'El nombre es obligatorio.';
    this.semestreError = '';
    this.descripcionError = '';

    if (this.tipo === 'materia' &&
      (this.semestre === null || this.semestre < 1 || this.semestre > 12 || !Number.isInteger(this.semestre))) {
      this.semestreError = 'El semestre debe ser un número válido.';
    }

    if (this.tipo === 'archivo' && !this.descripcion.trim()) {
      this.descripcionError = 'La descripción es obligatoria.';
    }

    if (this.nombreError || this.semestreError || this.descripcionError) {
      return;
    }

    this.guardar.emit({
      nombre: this.nombre.trim(),
      semestre: this.tipo === 'materia' ? this.semestre as number : undefined,
      descripcion: this.tipo === 'archivo' ? this.descripcion.trim() : undefined
    });
  }

}

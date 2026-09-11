import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-actualizar-modal',
  templateUrl: './actualizar-modal.component.html',
  styleUrls: ['./actualizar-modal.component.scss']
})
export class ActualizarModalComponent {
  @Input() visible = false;
  @Input() registro = '';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

}

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent {
  @Input() visible = false;
  @Input() registrado = false;
  @Input() nombre = '';
  @Input() correo = '';
  @Input() rol = '';
  @Input() idUsuario = '';
  @Output() cerrar = new EventEmitter<void>();

}

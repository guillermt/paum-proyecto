import { Component, OnInit } from '@angular/core';
import { Materia, MateriasService } from '../../services/materias.service';
import { FacadeService } from '../../services/facade.service';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  nombreUsuario = 'usuario';
  mostrarInfo = false;
  usuarioRegistrado = false;
  correoUsuario = '';
  rolUsuario = '';
  idUsuario = '';
  materias: Materia[] = [];
  materiasPorSemestre: Record<number, Materia[]> = {};
  cargando = true;
  error = false;

  constructor(
    private materiasService: MateriasService,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    this.nombreUsuario = this.obtenerNombreUsuario();
    this.cargarInformacionUsuario();
    this.facadeService.identityChanged$.subscribe((nombre) => {
      this.nombreUsuario = nombre.trim() || 'usuario';
      this.cargarInformacionUsuario();
    });
    this.materiasService.obtenerMaterias().subscribe({
      next: (materias) => {
        this.materias = materias;
        materias.forEach((materia) => {
          if (!this.materiasPorSemestre[materia.semestre]) {
            this.materiasPorSemestre[materia.semestre] = [];
          }
          this.materiasPorSemestre[materia.semestre].push(materia);
        });
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  abrirInformacion(): void {
    this.mostrarInfo = true;
  }

  cerrarInformacion(): void {
    this.mostrarInfo = false;
  }

  get semestres(): number[] {
    return Object.keys(this.materiasPorSemestre)
      .map(Number)
      .sort((first, second) => first - second);
  }

  nombreSemestre(semestre: number): string {
    return `${semestre}${semestre === 1 ? 'er' : semestre === 2 ? 'do' : semestre === 3 ? 'er' : 'to'} semestre`;
  }

  private obtenerNombreUsuario(): string {
    const nombre = this.facadeService.getUserCompleteName().trim();
    return nombre || 'usuario';
  }

  private cargarInformacionUsuario(): void {
    const token = this.facadeService.getSessionToken();
    this.usuarioRegistrado = !!token;
    this.correoUsuario = token ? this.facadeService.getUserEmail() : '';
    this.rolUsuario = token ? this.facadeService.getUserGroup() : '';
    this.idUsuario = token ? this.facadeService.getUserId() : '';
  }

}

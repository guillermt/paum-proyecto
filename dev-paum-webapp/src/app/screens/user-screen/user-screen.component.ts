import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Archivo, ArchivosService } from '../../services/archivos.service';
import { ArchivosMateriasService } from '../../services/archivos-materias.service';
import { FacadeService } from '../../services/facade.service';
import { MateriasService } from '../../services/materias.service';

interface ArchivoVisible extends Archivo {
  materiaId?: number;
}

@Component({
  selector: 'app-user-screen',
  templateUrl: './user-screen.component.html',
  styleUrls: ['./user-screen.component.scss']
})
export class UserScreenComponent implements OnInit {

  displayedColumns: string[] = [
    'nombre',
    'ver',
    'descargar'
  ];

  nombreUsuario = '';
  nombreMateria = '';
  materiaId?: number;
  errorMessage = '';
  cargando = false;
  dataSource = new MatTableDataSource<ArchivoVisible>([]);

  getUserRole(): string {
    const role = (this.facadeService.getUserGroup() || '').toLowerCase();
    return role || 'internauta';
  }

  puedeVerArchivo(): boolean {
    return this.getUserRole() === 'internauta' || this.getUserRole() === 'estudiante' || this.getUserRole() === 'admin' || this.getUserRole() === 'administrador';
  }

  puedeDescargarArchivo(): boolean {
    return this.getUserRole() === 'estudiante' || this.getUserRole() === 'admin' || this.getUserRole() === 'administrador';
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  @ViewChild(MatSort)
  set sort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private facadeService: FacadeService,
    private archivosMateriasService: ArchivosMateriasService,
    private archivosService: ArchivosService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    this.nombreUsuario = this.facadeService.getUserCompleteName() || 'usuario';

    if (this.facadeService.getSessionToken()) {
      this.facadeService.retrieveSignedUser().subscribe({
        next: (usuario) => {
          const identity = usuario?.user || usuario;
          this.nombreUsuario = identity?.nombre_usuario || identity?.email || this.nombreUsuario;
          this.facadeService.saveUserIdentity(identity);
        }
      });
    }

    this.route.paramMap.subscribe((params) => {
      const idMateria = Number(params.get('idMateria'));
      this.materiaId = Number.isInteger(idMateria) && idMateria > 0 ? idMateria : undefined;
      this.dataSource.data = [];
      this.errorMessage = '';
      this.nombreMateria = '';

      if (this.materiaId) {
        this.cargarNombreMateria(this.materiaId);
        this.cargarArchivos(this.materiaId);
      } else {
        this.cargarTodosLosArchivos();
      }
    });
  }

  private cargarNombreMateria(materiaId: number): void {
    this.materiasService.obtenerMaterias().subscribe({
      next: (materias) => {
        const materia = materias.find((item) => item.id === materiaId);
        this.nombreMateria = materia?.nombre || 'Materia seleccionada';
      },
      error: () => {
        this.nombreMateria = 'Materia seleccionada';
      }
    });
  }

  cargarArchivos(materiaId: number): void {
    this.cargando = true;
    this.archivosMateriasService.obtenerArchivosPorMateria(materiaId).subscribe({
      next: (archivos) => {
        this.dataSource.data = Array.isArray(archivos)
          ? archivos.map((archivo) => ({ ...archivo, materiaId }))
          : [];
        this.cargando = false;
      },
      error: () => {
        this.dataSource.data = [];
        this.errorMessage = 'No fue posible obtener los archivos de esta materia.';
        this.cargando = false;
      }
    });
  }

  private cargarTodosLosArchivos(): void {
    this.cargando = true;
    this.archivosService.obtenerTodosLosArchivos().subscribe({
      next: (archivos) => {
        this.dataSource.data = Array.isArray(archivos) ? archivos : [];
        this.cargando = false;
      },
      error: () => {
        this.dataSource.data = [];
        this.errorMessage = 'No fue posible obtener los archivos.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  descargarArchivo(archivo: Archivo): void {
    this.archivosService.descargarArchivo(archivo.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo.nombre;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage = 'No fue posible descargar el archivo.'
    });
  }

}

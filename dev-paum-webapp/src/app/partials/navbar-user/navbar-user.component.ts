import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FacadeService } from '../../services/facade.service';
import { Materia, MateriasService } from '../../services/materias.service';

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss']
})
export class NavbarUserComponent implements OnInit {
  isMobileView = false;
  mobileOpen = false;

  // Estado independiente por cada dropdown para evitar que se abran todos juntos.
  openDropdowns: Record<'semestre1' | 'semestre2' | 'semestre3' | 'semestre4' | 'materias' | 'archivos' | 'eventosMobile' | 'materiasMobile', boolean> = {
    semestre1: false,
    semestre2: false,
    semestre3: false,
    semestre4: false,
    materias: false,
    archivos: false,
    eventosMobile: false,
    materiasMobile: false
  };

  // Se usa en el template: *ngIf="userInitial"
  userInitial = '';
  userName = '';
  materiasPorSemestre: Record<number, Materia[]> = {};

  constructor(
    private materiasService: MateriasService,
    private facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.actualizarVistaMovil();
    this.actualizarIdentidad(this.facadeService.getUserCompleteName());
    this.facadeService.retrieveSignedUser().subscribe({
      next: (user) => {
        const identity = user?.user || user;
        const name = identity?.nombre_usuario || identity?.email || '';
        this.actualizarIdentidad(name);
        this.facadeService.saveUserIdentity(identity);
      }
    });

    forkJoin([1, 2, 3, 4].map((semestre) =>
      this.materiasService.obtenerMateriasPorSemestre(semestre)
    )).subscribe((materiasPorSemestre) => {
      materiasPorSemestre.forEach((materias, index) => {
        this.materiasPorSemestre[index + 1] = materias;
      });
    });
  }

  @HostListener('window:resize')
  actualizarVistaMovil(): void {
    this.isMobileView = window.innerWidth <= 992;
    if (!this.isMobileView) {
      this.closeSidebar();
    }
  }

  private actualizarIdentidad(nombre: string | undefined): void {
    const role = this.getUserRole();

    if (!nombre?.trim() && role === 'internauta') {
      this.userName = 'Internauta';
      this.userInitial = 'I';
      return;
    }

    this.userName = nombre?.trim() || 'Internauta';
    this.userInitial = this.userName.charAt(0).toUpperCase();
  }

  getUserRole(): string {
    const role = (this.facadeService.getUserGroup() || '').toLowerCase();
    if (!role) {
      return 'internauta';
    }
    return role;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin' || this.getUserRole() === 'administrador';
  }

  isStudent(): boolean {
    return this.getUserRole() === 'estudiante';
  }

  isInternauta(): boolean {
    return !this.isAdmin() && !this.isStudent();
  }

  canSeeRegisterItem(): boolean { return this.isAdmin(); }
  canSeeAdminItems(): boolean { return this.isAdmin(); }
  canSeeTeacherItems(): boolean { return this.isAdmin(); }
  canSeeStudentItems(): boolean { return true; }

  // Abre solo el dropdown correspondiente y cierra los demás.
  toggleEventosDropdown(key: 'semestre1' | 'semestre2' | 'semestre3' | 'semestre4' | 'materias' | 'archivos'): void {
    const nextState = !this.openDropdowns[key];
    Object.keys(this.openDropdowns).forEach((dropdownKey) => {
      this.openDropdowns[dropdownKey as keyof typeof this.openDropdowns] = false;
    });
    this.openDropdowns[key] = nextState;
  }

  toggleEventosDropdownMobile(): void {
    const nextState = !this.openDropdowns.eventosMobile;
    Object.keys(this.openDropdowns).forEach((dropdownKey) => {
      this.openDropdowns[dropdownKey as keyof typeof this.openDropdowns] = false;
    });
    this.openDropdowns.eventosMobile = nextState;
  }

  toggleMateriasDropdownMobile(): void {
    const nextState = !this.openDropdowns.materiasMobile;
    Object.keys(this.openDropdowns).forEach((dropdownKey) => {
      this.openDropdowns[dropdownKey as keyof typeof this.openDropdowns] = false;
    });
    this.openDropdowns.materiasMobile = nextState;
  }

  toggleSidebar(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar(): void {
    this.mobileOpen = false;
  }

  haySesionActiva(): boolean {
    return !!this.facadeService.getSessionToken();
  }

  irADashboard(): void {
    this.router.navigate(['/home']);
  }

  // El componente usará siempre la paleta light.
  togglePalette(): void {
    // no-op: el estilo light es fijo para este componente.
  }

  logout(): void {
    if (!this.haySesionActiva()) {
      this.restablecerUsuarioDefault();
      this.router.navigate(['/home']);
      return;
    }

    this.facadeService.logout().subscribe({
      next: () => this.finalizarSesion(),
      error: () => this.finalizarSesion()
    });
  }

  private restablecerUsuarioDefault(): void {
    this.userName = 'Internauta';
    this.userInitial = 'I';
  }

  private finalizarSesion(): void {
    this.facadeService.destroyUser();
    this.closeSidebar();
    this.restablecerUsuarioDefault();
    this.router.navigate(['/home']);
  }
}

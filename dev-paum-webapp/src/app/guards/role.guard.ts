import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { FacadeService } from '../services/facade.service';

export type UserRole = 'internauta' | 'estudiante' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private facadeService: FacadeService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const permitido = route.data['roles'] as UserRole[] | undefined;
    const token = this.facadeService.getSessionToken();
    const rol = (this.facadeService.getUserGroup() || '').toLowerCase();
    const rolNormalizado = this.normalizarRol(rol);

    if (!permitido) {
      return true;
    }

    if (!token && rolNormalizado === 'internauta') {
      return permitido.includes('internauta');
    }

    if (permitido.includes(rolNormalizado)) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }

  private normalizarRol(rol: string): UserRole {
    const valor = (rol || '').toLowerCase();
    if (valor === 'admin' || valor === 'administrador') {
      return 'admin';
    }
    if (valor === 'estudiante') {
      return 'estudiante';
    }
    return 'internauta';
  }
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { FacadeService } from '../services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private facadeService: FacadeService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.facadeService.getSessionToken();
    const requiresAuth = route.data['requiresAuth'] === true;

    if (token || !requiresAuth) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}

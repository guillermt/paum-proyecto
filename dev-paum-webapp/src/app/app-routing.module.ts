import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { UserScreenComponent } from './screens/user-screen/user-screen.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { RegistroUsuariosComponent } from './partials/registro-usuarios/registro-usuarios.component';
import { OpcionSubidaScreenComponent } from './screens/opcion-subida-screen/opcion-subida-screen.component';
import { RegistroArchivoSingularComponent } from './partials/registro-archivo-singular/registro-archivo-singular.component';
import { RegistroArchivoMultipleComponent } from './partials/registro-archivo-multiple/registro-archivo-multiple.component';
import { RegistroMateriasComponent } from './partials/registro-materias/registro-materias.component';
import { VisorScreenComponent } from './screens/visor-screen/visor-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { ManipulacionArchivosComponent } from './partials/manipulacion-archivos/manipulacion-archivos.component';
import { ManipulacionMateriasComponent } from './partials/manipulacion-materias/manipulacion-materias.component';
import { ManipularUsuariosComponent } from './partials/manipular-usuarios/manipular-usuarios.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [{ path: '', component: LoginScreenComponent }]
  },

  {
    path: 'registro-usuarios',
    component: AuthLayoutComponent,
    children: [{ path: '', component: RegistroUsuariosScreenComponent }]
  },

  {
    path: 'registro-usuarios/:id',
    component: AuthLayoutComponent,
    children: [{ path: '', component: RegistroUsuariosComponent }]
  },

  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeScreenComponent,
        canActivate: [RoleGuard],
        data: { roles: ['internauta', 'estudiante', 'admin'] }
      },
      {
        path: 'user',
        component: UserScreenComponent,
        canActivate: [RoleGuard],
        data: { roles: ['internauta', 'estudiante', 'admin'] }
      },
      {
        path: 'user/:idMateria',
        component: UserScreenComponent,
        canActivate: [RoleGuard],
        data: { roles: ['internauta', 'estudiante', 'admin'] }
      },
      {
        path: 'visor-archivo/:idMateria/:idArchivo',
        component: VisorScreenComponent,
        canActivate: [RoleGuard],
        data: { roles: ['internauta', 'estudiante', 'admin'] }
      },
      {
        path: 'visor-archivo/:idArchivo',
        component: VisorScreenComponent,
        canActivate: [RoleGuard],
        data: { roles: ['internauta', 'estudiante', 'admin'] }
      },
      {
        path: 'registro-archivos',
        component: OpcionSubidaScreenComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'manipulacion-archivos',
        component: ManipulacionArchivosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'registro-materias',
        component: RegistroMateriasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'manipulacion-materias',
        component: ManipulacionMateriasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'manipular-usuarios',
        component: ManipularUsuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'registro-archivo-singular',
        component: RegistroArchivoSingularComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'registro-archivo-multiples',
        component: RegistroArchivoMultipleComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


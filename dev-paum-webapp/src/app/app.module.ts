import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { UserScreenComponent } from './screens/user-screen/user-screen.component';
import { NavbarUserComponent } from './partials/navbar-user/navbar-user.component';

//Angular material
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

// Paginación
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import { RegistroUsuariosComponent } from './partials/registro-usuarios/registro-usuarios.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';

//Ngx-cookie-service
import { CookieService } from 'ngx-cookie-service';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { OpcionSubidaScreenComponent } from './screens/opcion-subida-screen/opcion-subida-screen.component';
import { RegistroArchivoSingularComponent } from './partials/registro-archivo-singular/registro-archivo-singular.component';
import { RegistroArchivoMultipleComponent } from './partials/registro-archivo-multiple/registro-archivo-multiple.component';
import { RegistroMateriasComponent } from './partials/registro-materias/registro-materias.component';
import { VisorScreenComponent } from './screens/visor-screen/visor-screen.component';
import { ManipulacionArchivosComponent } from './partials/manipulacion-archivos/manipulacion-archivos.component';
import { ManipulacionMateriasComponent } from './partials/manipulacion-materias/manipulacion-materias.component';
import { FormularioCambiosComponent } from './partials/formulario-cambios/formulario-cambios.component';
import { EliminarModalComponent } from './modals/eliminar-modal/eliminar-modal.component';
import { ActualizarModalComponent } from './modals/actualizar-modal/actualizar-modal.component';
import { ManipularUsuariosComponent } from './partials/manipular-usuarios/manipular-usuarios.component';
import { InfoModalComponent } from './modals/info-modal/info-modal.component';



@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    DashboardLayoutComponent,
    HomeScreenComponent,
    AdminScreenComponent,
    UserScreenComponent,
    NavbarUserComponent,
    RegistroUsuariosComponent,
    LoginScreenComponent,
    RegistroUsuariosScreenComponent,
    OpcionSubidaScreenComponent,
    RegistroArchivoSingularComponent,
    RegistroArchivoMultipleComponent,
    RegistroMateriasComponent,
    VisorScreenComponent,
    ManipulacionArchivosComponent,
    ManipulacionMateriasComponent,
    FormularioCambiosComponent,
    EliminarModalComponent,
    ActualizarModalComponent,
    ManipularUsuariosComponent,
    InfoModalComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

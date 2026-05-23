import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { Reservas } from './reservas/reservas';
import { MisReuniones } from './mis-reuniones/mis-reuniones';
import { Recepcion } from './recepcion/recepcion';
import { Reportes } from './reportes/reportes';
import { Admin } from './admin/admin';
import { Perfil } from './perfil/perfil';
import { ReservaDetalle } from './reserva-detalle/reserva-detalle';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'reservas', component: Reservas },
      { path: 'reserva-detalle', component: ReservaDetalle },
      { path: 'mis-reuniones', component: MisReuniones },
      { path: 'recepcion', component: Recepcion },
      { path: 'reportes', component: Reportes },
      { path: 'admin', component: Admin },
      { path: 'perfil', component: Perfil }
    ]
  }
];
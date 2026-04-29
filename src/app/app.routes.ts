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

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'reservas', component: Reservas },
      { path: 'mis-reuniones', component: MisReuniones },
      { path: 'recepcion', component: Recepcion },
      { path: 'reportes', component: Reportes },
      { path: 'admin', component: Admin },
      { path: 'perfil', component: Perfil }
    ]
  }
];
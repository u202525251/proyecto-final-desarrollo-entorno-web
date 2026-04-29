import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  user: any = null;
  viewMode: string = 'admin';
  modeLabel: string = 'Vista Admin';
  roleLabel: string = 'Administrador';
  navItems: any[] = [];

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.user = this.sessionService.getUser();
    this.viewMode = this.sessionService.getViewMode();

    this.actualizarSidebar();
  }

  actualizarSidebar() {
    const isAdmin = this.viewMode === 'admin';
    const showReportes = this.viewMode !== 'usuario';

    this.modeLabel = isAdmin ? 'Vista Admin' : 'Vista Usuario';
    this.roleLabel = isAdmin ? 'Administrador' : 'Usuario';

    this.navItems = [
      {
        key: 'dashboard',
        label: 'Inicio',
        route: '/dashboard'
      },
      {
        key: 'reservas',
        label: 'Reservar',
        route: '/reservas'
      },
      {
        key: 'mis-reuniones',
        label: 'Mis Reuniones',
        route: '/mis-reuniones'
      },
      {
        key: 'recepcion',
        label: 'Recepción',
        route: '/recepcion'
      }
    ];

    if (showReportes) {
      this.navItems.push({
        key: 'reportes',
        label: 'Reportes',
        route: '/reportes'
      });
    }

    if (isAdmin) {
      this.navItems.push({
        key: 'admin',
        label: 'Administración',
        route: '/admin'
      });
    }

    this.navItems.push({
      key: 'perfil',
      label: 'Perfil',
      route: '/perfil'
    });
  }

  toggleViewMode(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.viewMode = 'admin';
    } else {
      this.viewMode = 'usuario';
    }

    this.sessionService.setViewMode(this.viewMode);
    this.actualizarSidebar();
  }
}
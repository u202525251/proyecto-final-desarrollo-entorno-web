import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // Añadido para manejar el *ngFor de navItems
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
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
    // Obtenemos el usuario y el modo inicial desde el servicio corregido
    this.user = this.sessionService.getUser();
    this.viewMode = this.sessionService.getViewMode(); // Ya no dará error TS2339

    this.actualizarSidebar();
  }

  actualizarSidebar() {
    const isAdmin = this.viewMode === 'admin';
    const showReportes = this.viewMode !== 'usuario';

    this.modeLabel = isAdmin ? 'Vista Admin' : 'Vista Usuario';
    this.roleLabel = isAdmin ? 'Administrador' : 'Usuario';

    // Lista base de navegación para todos los usuarios de la UPC
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
      }
    ];

    // Lógica condicional según el modo de vista
    if (this.viewMode === 'admin' || this.viewMode === 'recepcion') {
      this.navItems.push({
        key: 'recepcion',
        label: 'Recepción',
        route: '/recepcion'
      });
    }

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

    // Actualizamos el modo basándonos en el interruptor de la interfaz
    this.viewMode = checked ? 'admin' : 'usuario';

    // Guardamos el cambio en el servicio para que persista en toda la app
    this.sessionService.setViewMode(this.viewMode);
    
    // Refrescamos los elementos del menú visibles
    this.actualizarSidebar();
  }

  logout() {
    this.sessionService.logout();
  }
}
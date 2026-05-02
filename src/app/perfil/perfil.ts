import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit, AfterViewInit {
  user: any = null;

  notificaciones = [
    {
      titulo: 'Recordatorios de reunión',
      descripcion: 'Recibir notificación 15 min antes'
    },
    {
      titulo: 'Cambios en reservas',
      descripcion: 'Notificar si se modifica o cancela'
    },
    {
      titulo: 'Estado de EPP',
      descripcion: 'Alertas sobre préstamos y devoluciones'
    },
    {
      titulo: 'Sincronización Outlook',
      descripcion: 'Confirmación de sync con Microsoft 365'
    }
  ];

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.sessionService.requireLogin()) {
      this.router.navigate(['/']);
      return;
    }

    this.user = this.sessionService.getUser();
  }

  ngAfterViewInit() {
    this.cargarIconos();
  }

  cargarIconos() {
    setTimeout(() => {
      const lucide = (window as any).lucide;

      if (lucide) {
        lucide.createIcons();
      }
    }, 0);
  }

  cerrarSesion() {
    this.sessionService.logout();
    this.router.navigate(['/']);
  }
}
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class Dashboard implements OnInit {
  user: any = null;

  stats = [
  { icon: '📅', value: 2, label: 'Reuniones Hoy' },
  { icon: '🕒', value: 3, label: 'Próximas' },
  { icon: '👥', value: 4, label: 'Con Visitantes' },
  { icon: '⛑', value: 2, label: 'EPP Activos' }
];

reunionesFuturas = [
  {
    titulo: 'Comité de Riesgos Trimestral',
    fecha: '2026-02-16',
    hora: '09:00 - 10:30',
    sala: 'Sala Ejecutiva A',
    estado: 'Confirmada',
    visitantes: 0,
    epp: false
  },
  {
    titulo: 'Revisión Compliance Q1',
    fecha: '2026-02-17',
    hora: '14:00 - 15:00',
    sala: 'Sala de Juntas B',
    estado: 'Pendiente',
    visitantes: 1,
    epp: false
  },
  {
    titulo: 'Capacitación EPP Seguridad',
    fecha: '2026-02-18',
    hora: '10:00 - 12:00',
    sala: 'Sala Capacitación',
    estado: 'Confirmada',
    visitantes: 1,
    epp: true
  }
];

reunionesPasadas = [
  {
    titulo: 'Reunión con Cliente VIP',
    detalle: '2026-02-13 11:00 - 12:00 Sala Ejecutiva A',
    asistentes: 'María López, Juan García'
  },
  {
    titulo: 'Llamada Rápida Tesorería',
    detalle: '2026-02-10 16:00 - 16:30 Phone Booth 1',
    asistentes: 'Carlos Ruiz'
  }
];

listaEpp = [
  {
    nombre: 'Carlos Méndez',
    detalle: 'Proveedor - TLSolutions · 3 equipo(s)',
    estado: 'Entregado',
    color: 'verde'
  },
  {
    nombre: 'Ana Torres',
    detalle: 'ClienteCorp · 2 equipo(s)',
    estado: 'Pendiente de recojo',
    color: 'naranja'
  },
  {
    nombre: 'Luis García',
    detalle: 'ExternaCo · 1 equipo(s)',
    estado: 'Pendiente de devolución',
    color: 'rojo'
  }
];



  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.user = this.sessionService.getUser();
  }
}
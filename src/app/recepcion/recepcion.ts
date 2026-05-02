import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recepcion.html',
  styleUrl: './recepcion.css'
})
export class Recepcion {
  stats = [
    { icon: 'fa-regular fa-calendar', value: 2, label: 'Reuniones hoy' },
    { icon: 'fa-solid fa-users', value: 3, label: 'Visitantes del día' },
    { icon: 'fa-regular fa-circle-check', value: '2/3', label: 'Entregados' }
  ];

  alertas = [
    {
      icon: 'fa-solid fa-box-open',
      value: 1,
      title: 'Pendientes de recojo',
      detail: 'Visitantes aún no atendidos en recepción',
      type: 'orange'
    },
    {
      icon: 'fa-solid fa-rotate-left',
      value: 2,
      title: 'Pendientes de devolución',
      detail: 'EPP entregado y pendiente de retorno',
      type: 'purple'
    },
    {
      icon: 'fa-solid fa-triangle-exclamation',
      value: 1,
      title: 'Alertas de stock crítico',
      detail: 'Zapatos punta de acero',
      type: 'red'
    }
  ];

  reuniones = [
    {
      titulo: 'Revisión Inventario EPP',
      hora: '08:00 - 09:00',
      sala: 'Sala Almacén Norte',
      estado: 'Pendiente recojo',
      estadoClase: 'orange',
      visitantes: [
        {
          iniciales: 'DP',
          nombre: 'Diego Paredes',
          empresa: 'Seguridad Total',
          estado: 'Pendiente recojo'
        },
        {
          iniciales: 'MS',
          nombre: 'María Soto',
          empresa: 'Seguridad Total',
          estado: 'Entregado'
        }
      ]
    },
    {
      titulo: 'Inspección de seguridad operativa',
      hora: '15:00 - 17:00',
      sala: 'Sala Almacén Sur',
      estado: 'Entregado',
      estadoClase: 'green',
      visitantes: [
        {
          iniciales: 'CR',
          nombre: 'Carlos Ruiz',
          empresa: 'Seguridad Total',
          estado: 'Entregado'
        }
      ]
    }
  ];

  marcarEstado(visitante: any, estado: string) {
    visitante.estado = estado;
  }
}
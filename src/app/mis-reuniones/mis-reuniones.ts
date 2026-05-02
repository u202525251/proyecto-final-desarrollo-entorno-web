import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reuniones.html',
  styleUrl: './mis-reuniones.css'
})
export class MisReuniones {
  filtro = 'Todas';

  reservas = [
    {
      titulo: 'Capacitación EPP Seguridad',
      sala: 'Sala Capacitación',
      fecha: '2026-03-13',
      hora: '10:00 - 12:00',
      estado: 'Confirmada',
      checkin: 'Sin check-in',
      internos: 2,
      externos: 2,
      epp: 'Pendiente recojo',
      qr: true,
      participantes: [
        { nombre: 'Katya Imán', tipo: 'Organizador' },
        { nombre: 'Jorge Medina', tipo: 'Interno corporativo' },
        { nombre: 'Luis Cárdenas', tipo: 'Interno corporativo' },
        { nombre: 'Mónica Salas', tipo: 'Proveedor' },
        { nombre: 'Diego Castañeda', tipo: 'Cliente' }
      ]
    },
    {
      titulo: 'Revisión Compliance Q1',
      sala: 'Sala de Juntas B',
      fecha: '2026-03-13',
      hora: '14:00 - 15:00',
      estado: 'Pendiente',
      checkin: '',
      internos: 2,
      externos: 1,
      epp: '',
      qr: false,
      participantes: [
        { nombre: 'Renzo Núñez', tipo: 'Organizador' },
        { nombre: 'Paola Rivas', tipo: 'Interno corporativo' },
        { nombre: 'Andrea Flores', tipo: 'Interno corporativo' },
        { nombre: 'Carla Méndez', tipo: 'Corporativo externo' }
      ]
    },
    {
      titulo: 'Capacitación Personal Nuevo',
      sala: 'Sala Ejecutiva A',
      fecha: '2026-03-13',
      hora: '09:00 - 10:30',
      estado: 'Confirmada',
      checkin: 'Check-in realizado',
      internos: 2,
      externos: 0,
      epp: '',
      qr: true,
      participantes: [
        { nombre: 'Juan García', tipo: 'Organizador' },
        { nombre: 'Lucía Fernández', tipo: 'Interno corporativo' },
        { nombre: 'Carlos Ruiz', tipo: 'Interno corporativo' }
      ]
    },
    {
      titulo: 'Comité de Riesgos Trimestral',
      sala: 'Sala Huascarán',
      fecha: '2026-03-13',
      hora: '11:00 - 12:00',
      estado: 'Confirmada',
      checkin: 'Check-in realizado',
      internos: 2,
      externos: 1,
      epp: '',
      qr: true,
      participantes: [
        { nombre: 'Katya Imán', tipo: 'Organizador' },
        { nombre: 'Pedro Benites', tipo: 'Interno corporativo' },
        { nombre: 'Sebastián Ponce', tipo: 'Interno corporativo' },
        { nombre: 'Sofía Delgado', tipo: 'Cliente' }
      ]
    }
  ];

  get reservasFiltradas() {
    if (this.filtro === 'Todas') return this.reservas;
    return this.reservas.filter(r => r.estado === this.filtro);
  }

  mostrarQR(reserva: any) {
    alert(`Mostrando QR para: ${reserva.titulo}`);
  }

  editarReserva(reserva: any) {
    alert(`Editar reserva: ${reserva.titulo}`);
  }

  eliminarReserva(reserva: any) {
    const confirmar = confirm(`¿Deseas eliminar la reserva "${reserva.titulo}"?`);
    if (confirmar) {
      this.reservas = this.reservas.filter(r => r !== reserva);
    }
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class Reservas {
  sedeSeleccionada = 'Todas';
  tipoSeleccionado = 'Todas';
  equipamientoSeleccionado = 'Todos';
  capacidadMinima = 1;

  salas = [
    {
      nombre: 'Sala Huascarán',
      sede: 'Oficinas',
      piso: 'Piso 5',
      tipo: 'Premium',
      capacidad: 16,
      estado: 'Habilitada',
      equipamiento: ['Videoconferencia', 'Casting inalámbrico', 'Pizarra táctil', 'Frigobar', 'Sonido ambiental', 'Micrófono']
    },
    {
      nombre: 'Sala Ejecutiva A',
      sede: 'Oficinas',
      piso: 'Piso 3',
      tipo: 'Ejecutiva',
      capacidad: 12,
      estado: 'Habilitada',
      equipamiento: ['Videoconferencia', 'Casting inalámbrico', 'Pizarra táctil']
    },
    {
      nombre: 'Sala de Juntas B',
      sede: 'Oficinas',
      piso: 'Piso 2',
      tipo: 'Juntas',
      capacidad: 8,
      estado: 'Habilitada',
      equipamiento: ['Videoconferencia', 'Casting inalámbrico', 'Pantalla estándar']
    },
    {
      nombre: 'Sala Almacén Norte',
      sede: 'Almacén',
      piso: 'Zona A',
      tipo: 'Almacén',
      capacidad: 6,
      estado: 'Deshabilitada',
      equipamiento: ['Videoconferencia', 'Pantalla estándar']
    },
    {
      nombre: 'Sala Capacitación',
      sede: 'Almacén',
      piso: 'Zona B',
      tipo: 'Capacitación',
      capacidad: 20,
      estado: 'Habilitada',
      equipamiento: ['Videoconferencia', 'Casting inalámbrico', 'Pizarra táctil', 'Sonido ambiental', 'Micrófono']
    }
  ];

  get salasFiltradas() {
    return this.salas.filter(sala => {
      const cumpleSede = this.sedeSeleccionada === 'Todas' || sala.sede === this.sedeSeleccionada;
      const cumpleTipo = this.tipoSeleccionado === 'Todas' || sala.tipo === this.tipoSeleccionado;
      const cumpleCapacidad = sala.capacidad >= this.capacidadMinima;
      const cumpleEquipamiento =
        this.equipamientoSeleccionado === 'Todos' ||
        sala.equipamiento.includes(this.equipamientoSeleccionado);

      return cumpleSede && cumpleTipo && cumpleCapacidad && cumpleEquipamiento;
    });
  }

  limpiarFiltros() {
    this.sedeSeleccionada = 'Todas';
    this.tipoSeleccionado = 'Todas';
    this.equipamientoSeleccionado = 'Todos';
    this.capacidadMinima = 1;
  }

  reservarSala(sala: any) {
    if (sala.estado === 'Deshabilitada') {
      alert('Esta sala no está disponible.');
      return;
    }

    alert(`Reserva iniciada para: ${sala.nombre}`);
  }
}
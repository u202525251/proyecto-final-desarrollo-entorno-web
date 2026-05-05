import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../services/session.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class Reservas implements OnInit {
  sedeSeleccionada: string = 'Todas';
  capacidadMinima: number = 1;

  tituloReunion: string = ''; 
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  requiereEPP: boolean = false; 

  salas: any[] = [];

  constructor(private sessionService: SessionService, private router: Router) {}

  ngOnInit() {
    this.cargarSalasDeAWS();
  }

  cargarSalasDeAWS() {
    const salasData = sessionStorage.getItem("sc_salas");
    if (salasData) {
      this.salas = JSON.parse(salasData);
    } else {
      this.sessionService.cargarConfiguracionInicial();
    }
  }

  get salasFiltradas() {
    return this.salas.filter(sala => {
      const cumpleSede = this.sedeSeleccionada === 'Todas' || sala.sede === this.sedeSeleccionada;
      const cumpleCapacidad = (sala.capacidad || 0) >= this.capacidadMinima;
      return cumpleSede && cumpleCapacidad;
    });
  }

  reservarSala(sala: any) {
    // Generamos el ID numérico secuencial (Timestamp)
    const idSecuencial = Date.now(); 

    const payload = {
      id_reunion: idSecuencial,
      titulo: this.tituloReunion,
      // CORRECCIÓN: Usamos nombre_sala como se ve en tu imagen
      lugar: sala.nombre_sala, 
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      epp: this.requiereEPP,
      externos: false,
      estado: 'confirmada',
      organizador: this.sessionService.getUser(),
      fecha_registro: new Date().toISOString()
    };

    this.sessionService.crearReserva(payload).subscribe({
      next: () => {
        alert(`¡Reserva Exitosa en ${sala.nombre_sala}! ID: ${idSecuencial}`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => alert('Error al guardar en DynamoDB.')
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../services/session.service'; // Importamos tu servicio corregido

@Component({
  selector: 'app-mis-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reuniones.html',
  styleUrl: './mis-reuniones.css'
})
export class MisReuniones implements OnInit {
  filtro = 'Todas';
  reservas: any[] = []; // Ahora iniciamos el arreglo vacío

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.cargarReservasDesdeAWS();
  }

  cargarReservasDesdeAWS() {
    // 1. Obtenemos los datos que el servicio guardó al hacer Login o cargar el Dashboard
    const data = sessionStorage.getItem("sc_reuniones");
    
    if (data) {
      this.reservas = JSON.parse(data);
    } else {
      // 2. Si no hay datos (por ejemplo, al refrescar la página), forzamos la descarga
      this.sessionService.cargarConfiguracionInicial();
      
      // Intentamos recuperar después de un breve delay para permitir que la API responda
      setTimeout(() => {
        const dataRetry = sessionStorage.getItem("sc_reuniones");
        if (dataRetry) this.reservas = JSON.parse(dataRetry);
      }, 1000);
    }
  }

  get reservasFiltradas() {
    // La lógica de filtrado se mantiene igual, pero operando sobre datos reales
    if (this.filtro === 'Todas') return this.reservas;
    return this.reservas.filter(r => r.estado === this.filtro);
  }

  mostrarQR(reserva: any) {
    // Puedes implementar una lógica real de QR aquí más adelante
    alert(`Código QR generado para: ${reserva.titulo}\nSala: ${reserva.lugar}`);
  }

  eliminarReserva(reserva: any) {
    const confirmar = confirm(`¿Deseas eliminar la reserva "${reserva.titulo}" de DynamoDB?`);
    if (confirmar) {
      // Aquí podrías llamar a un método 'eliminar' en tu SessionService si decides crear esa Lambda
      this.reservas = this.reservas.filter(r => r !== reserva);
      // Actualizamos la persistencia local
      sessionStorage.setItem("sc_reuniones", JSON.stringify(this.reservas));
    }
  }

  // Mantenemos el método para evitar errores si está en tu HTML
  editarReserva(reserva: any) {
    alert(`Redirigiendo a edición de: ${reserva.titulo}`);
  }
}
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
  
  reunionesFuturas: any[] = [];
  reunionesPasadas: any[] = [];
  listaEpp: any[] = [];

  stats = [
    { icon: '📅', value: 0, label: 'Reuniones Hoy' },
    { icon: '🕒', value: 0, label: 'Próximas' },
    { icon: '👥', value: 0, label: 'Con Visitantes' },
    { icon: '⛑', value: 0, label: 'EPP Activos' }
  ];

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.user = this.sessionService.getUser();

    // 1. Intentamos cargar datos inmediatamente
    this.cargarDatosDesdeAWS();

    // 2. Si no hay datos, forzamos la sincronización con AWS
    if (this.reunionesFuturas.length === 0 && this.listaEpp.length === 0) {
      this.sessionService.cargarConfiguracionInicial();
      
      // Esperamos a que la respuesta de AWS llegue y se guarde
      setTimeout(() => {
        this.cargarDatosDesdeAWS();
      }, 1500);
    }
  }

  cargarDatosDesdeAWS() {
    // Recuperamos los strings de sessionStorage
    const reunionesData = sessionStorage.getItem("sc_reuniones");
    const eppData = sessionStorage.getItem("sc_epp");

    if (reunionesData) {
      const todas = JSON.parse(reunionesData);
      
      // Filtramos según el estado para la HU-10[cite: 1]
      this.reunionesFuturas = todas.filter((r: any) => r.estado !== 'finalizada');
      this.reunionesPasadas = todas.filter((r: any) => r.estado === 'finalizada');
      
      // Actualizamos contadores del Dashboard
      this.stats[0].value = this.reunionesFuturas.length;
      this.stats[1].value = todas.length;
      this.stats[2].value = todas.filter((r: any) => r.externos === true).length;
    }

    if (eppData) {
      const catalogo = JSON.parse(eppData);
      this.listaEpp = catalogo.map((e: any) => ({
        nombre: e.nombre,
        detalle: `Stock: ${e.stock} | En uso: ${e.enUso}`,
        estado: e.stock > 0 ? 'Disponible' : 'Sin Stock',
        color: e.stock > 5 ? 'verde' : 'rojo' // Alerta visual de stock (HU-06)[cite: 1]
      }));
      
      this.stats[3].value = catalogo.filter((e: any) => e.enUso > 0).length;
    }
  }
}
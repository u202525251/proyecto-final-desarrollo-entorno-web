import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-mis-reuniones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reuniones.html',
  styleUrl: './mis-reuniones.css'
})
export class MisReuniones implements OnInit {
  reuniones: any[] = [];
  loading: boolean = true;

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.obtenerReuniones();
  }

  obtenerReuniones(): void {
    // 1. Intentamos obtener los datos de la sesión que pobló la API de AWS
    const data = sessionStorage.getItem("sc_reuniones");
    
    if (data) {
      // 2. Parseamos el JSON que viene de la imagen image_3ad57f.png
      const todas = JSON.parse(data);
      
      // 3. Opcional: Filtrar para que el usuario solo vea sus reuniones
      const user = this.sessionService.getUser();
      this.reuniones = todas.filter((r: any) => 
        r.organizador?.correo === user?.email || r.organizador === user?.nombre
      );
      
      this.loading = false;
    } else {
      // 4. Si no hay datos, forzamos una carga desde AWS
      this.sessionService.cargarConfiguracionInicial();
      this.loading = false;
    }
  }

  // Método para refrescar manualmente
  refresh(): void {
    this.loading = true;
    this.sessionService.cargarConfiguracionInicial();
    setTimeout(() => this.obtenerReuniones(), 1000);
  }
}
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class Reservas implements OnInit, AfterViewInit {
  sedeSeleccionada: string = 'todas';
  tipoSeleccionado: string = 'todas';
  capacidadMinima: number = 1;

  equipamientos: string[] = [];
  equipamientosSeleccionados: string[] = [];
  comboEquipamientoAbierto: boolean = false;

  salas: any[] = [];
  salasFiltradas: any[] = [];

  cargando: boolean = false;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarSalas();
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

  cargarSalas() {
    this.cargando = true;

    this.sessionService.getSalas().subscribe({
      next: (data: any[]) => {
        this.salas = (data || []).map((sala: any) => {
          return {
            ...sala,
            nombre: sala.nombre || sala.nombre_sala || '',
            sede: sala.sede || '',
            ubicacion: sala.ubicacion || '',
            tipo: sala.tipo || 'regular',
            capacidad: Number(sala.capacidad || 0),
            estado: sala.estado || 'habilitada',
            equipamiento: Array.isArray(sala.equipamiento) ? sala.equipamiento : []
          };
        });

        this.equipamientos = [
          ...new Set(
            this.salas.flatMap((sala: any) => sala.equipamiento)
          )
        ].sort();

        this.aplicarFiltros();

        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al cargar salas', err);
        this.cargando = false;
        alert('No se pudieron cargar las salas.');
      }
    });
  }

  aplicarFiltros() {
    this.salasFiltradas = this.salas.filter((sala: any) => {
      const cumpleSede =
        this.sedeSeleccionada === 'todas' || sala.sede === this.sedeSeleccionada;

      const cumpleTipo =
        this.tipoSeleccionado === 'todas' || sala.tipo === this.tipoSeleccionado;

      const cumpleCapacidad =
        Number(sala.capacidad || 0) >= Number(this.capacidadMinima || 1);

      const equipamientoSala = Array.isArray(sala.equipamiento) ? sala.equipamiento : [];

      const cumpleEquipamiento =
        this.equipamientosSeleccionados.length === 0 ||
        this.equipamientosSeleccionados.every((equipo: string) =>
          equipamientoSala.includes(equipo)
        );

      return cumpleSede && cumpleTipo && cumpleCapacidad && cumpleEquipamiento;
    });

    this.cdr.detectChanges();
    this.cargarIconos();
  }

  limpiarFiltros() {
    this.sedeSeleccionada = 'todas';
    this.tipoSeleccionado = 'todas';
    this.capacidadMinima = 1;
    this.equipamientosSeleccionados = [];
    this.comboEquipamientoAbierto = false;

    this.aplicarFiltros();
  }

  toggleComboEquipamiento() {
    this.comboEquipamientoAbierto = !this.comboEquipamientoAbierto;
    this.cargarIconos();
  }

  toggleEquipamiento(equipo: string) {
    if (this.equipamientosSeleccionados.includes(equipo)) {
      this.equipamientosSeleccionados = this.equipamientosSeleccionados.filter(
        e => e !== equipo
      );
    } else {
      this.equipamientosSeleccionados = [
        ...this.equipamientosSeleccionados,
        equipo
      ];
    }

    this.aplicarFiltros();
  }

  limpiarEquipamiento() {
    this.equipamientosSeleccionados = [];
    this.aplicarFiltros();
  }

  getTextoEquipamiento() {
    if (this.equipamientosSeleccionados.length === 0) {
      return 'Todos';
    }

    if (this.equipamientosSeleccionados.length === 1) {
      return this.equipamientosSeleccionados[0];
    }

    return this.equipamientosSeleccionados.length + ' seleccionados';
  }

  seleccionarSala(sala: any) {
    if (sala.estado === 'deshabilitada') {
      alert('Esta sala no está disponible.');
      return;
    }

    const defaults = this.obtenerHorarioDefecto();

    const borrador = {
      sala: sala.nombre,
      id_sala: sala.id_sala,
      sede: sala.sede === 'almacen' ? 'Almacén' : 'Oficinas',
      sedeKey: sala.sede,
      ubicacion: sala.ubicacion,
      tipo: sala.tipo,
      capacidad: sala.capacidad,
      equipamiento: sala.equipamiento,
      fecha: defaults.fecha,
      horaInicio: defaults.horaInicio,
      horaFin: defaults.horaFin,
      invitadosInternos: [],
      invitadosExternos: [],
      conInvitados: false
    };

    sessionStorage.setItem('sc_reserva_borrador', JSON.stringify(borrador));

    this.router.navigate(['/reserva-detalle']);
  }

  obtenerHorarioDefecto() {
    const fecha = new Date();

    fecha.setDate(fecha.getDate() + 1);

    const dia = fecha.getDay();

    if (dia === 0) {
      fecha.setDate(fecha.getDate() + 1);
    }

    if (dia === 6) {
      fecha.setDate(fecha.getDate() + 2);
    }

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return {
      fecha: `${yyyy}-${mm}-${dd}`,
      horaInicio: '09:00',
      horaFin: '10:00'
    };
  }
}
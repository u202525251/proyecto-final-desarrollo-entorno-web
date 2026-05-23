import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  user: any = null;

  cargando: boolean = false;

  reservas: any[] = [];
  reunionesFuturas: any[] = [];
  reunionesPasadas: any[] = [];
  listaEpp: any[] = [];

  stats: any[] = [
    {
      icon: 'calendar',
      value: 0,
      label: 'Reuniones Hoy'
    },
    {
      icon: 'clock',
      value: 0,
      label: 'Próximas'
    },
    {
      icon: 'users',
      value: 0,
      label: 'Con Visitantes'
    },
    {
      icon: 'hard-hat',
      value: 0,
      label: 'EPP Activos'
    }
  ];

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.sessionService.getUser();
    this.cargarReservas();
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

  cargarReservas() {
    if (!this.user || !this.user.correo) {
      this.reservas = [];
      this.actualizarDashboard();
      return;
    }

    this.cargando = true;

    this.sessionService.getMisReservas(this.user.correo).subscribe({
      next: (data: any[]) => {
        this.reservas = (data || []).map((item: any) => this.normalizarReserva(item));

        this.actualizarDashboard();

        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al cargar reservas para inicio', err);

        this.reservas = [];
        this.actualizarDashboard();

        this.cargando = false;
        alert('No se pudieron cargar los datos del inicio.');
      }
    });
  }

  normalizarReserva(item: any) {
    const reserva = {
      ...item,
      id_reserva: item.id_reserva || item.id || '',
      titulo: item.titulo || 'Reserva sin título',
      fecha: item.fecha || '',
      hora: item.hora || '',
      lugar: item.lugar || item.sala || 'Sala no registrada',
      estado: item.estado || 'confirmada',
      externos: item.externos === true,
      cantidadExternos: Number(item.cantidadExternos || 0),
      cantidadInternos: Number(item.cantidadInternos || 0),
      epp: item.epp === true,
      estadoEpp: item.estadoEpp || '',
      checkin: item.checkin || 'Sin check-in',
      invitadosInternos: Array.isArray(item.invitadosInternos) ? item.invitadosInternos : [],
      invitadosExternos: Array.isArray(item.invitadosExternos) ? item.invitadosExternos : [],
      organizador: item.organizador || this.user
    };

    reserva.futura = this.esReservaFutura(reserva);
    reserva.esHoy = this.esReservaDeHoy(reserva);

    return reserva;
  }

  actualizarDashboard() {
    this.reunionesFuturas = this.reservas
      .filter((r: any) => r.futura)
      .sort((a: any, b: any) => {
        const fechaA = `${a.fecha || ''} ${a.hora || ''}`;
        const fechaB = `${b.fecha || ''} ${b.hora || ''}`;
        return fechaA.localeCompare(fechaB);
      });

    this.reunionesPasadas = this.reservas
      .filter((r: any) => !r.futura)
      .sort((a: any, b: any) => {
        const fechaA = `${a.fecha || ''} ${a.hora || ''}`;
        const fechaB = `${b.fecha || ''} ${b.hora || ''}`;
        return fechaB.localeCompare(fechaA);
      });

    this.listaEpp = this.construirListaEpp();

    this.stats = [
      {
        icon: 'calendar',
        value: this.reservas.filter((r: any) => r.esHoy).length,
        label: 'Reuniones Hoy'
      },
      {
        icon: 'clock',
        value: this.reunionesFuturas.length,
        label: 'Próximas'
      },
      {
        icon: 'users',
        value: this.reservas.filter((r: any) => r.externos).length,
        label: 'Con Visitantes'
      },
      {
        icon: 'hard-hat',
        value: this.reservas.filter((r: any) => r.epp).length,
        label: 'EPP Activos'
      }
    ];
  }

  construirListaEpp() {
    const reservasConEpp = this.reservas.filter((r: any) => r.epp);

    return reservasConEpp.map((reserva: any) => {
      const nombresExternos = reserva.invitadosExternos
        .map((item: any) => item.nombre)
        .filter((nombre: string) => !!nombre)
        .join(', ');

      const nombrePrincipal =
        nombresExternos ||
        reserva.titulo ||
        'Reserva con EPP';

      const cantidadEquipos =
        reserva.cantidadExternos > 0
          ? reserva.cantidadExternos
          : 1;

      const estado =
        reserva.estadoEpp ||
        'Pendiente recojo';

      return {
        nombre: nombrePrincipal,
        detalle: `${reserva.lugar} · ${cantidadEquipos} equipo(s)`,
        estado: estado,
        color: this.obtenerColorEpp(estado)
      };
    });
  }

  obtenerColorEpp(estado: string) {
    const texto = String(estado || '').toLowerCase();

    if (texto.includes('entregado')) {
      return 'green';
    }

    if (texto.includes('devolución') || texto.includes('devolucion')) {
      return 'red';
    }

    return 'orange';
  }

  esReservaFutura(reserva: any): boolean {
    if (!reserva.fecha) {
      return true;
    }

    const horaInicio = String(reserva.hora || '').split(' - ')[0] || '00:00';
    const fechaHoraReserva = new Date(`${reserva.fecha}T${horaInicio}:00`);
    const ahora = new Date();

    if (isNaN(fechaHoraReserva.getTime())) {
      return true;
    }

    return fechaHoraReserva >= ahora;
  }

  esReservaDeHoy(reserva: any): boolean {
    if (!reserva.fecha) {
      return false;
    }

    const hoy = new Date();

    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    const fechaHoy = `${yyyy}-${mm}-${dd}`;

    return reserva.fecha === fechaHoy;
  }

  getEstadoClase(reserva: any) {
    if (reserva.estado === 'confirmada') {
      return 'badge-success';
    }

    return 'badge-warning';
  }

  getEstadoTexto(reserva: any) {
    if (reserva.estado === 'confirmada') {
      return 'Confirmada';
    }

    return 'Pendiente';
  }

  repetirReserva(reserva: any) {
    const partesHora = String(reserva.hora || '').split(' - ');

    const borrador = {
      modoEdicion: false,
      titulo: reserva.titulo || '',
      sala: reserva.lugar || reserva.sala || 'Sala no registrada',
      id_sala: reserva.id_sala || '',
      sede: reserva.sede || '',
      sedeKey: reserva.sedeKey || '',
      ubicacion: reserva.ubicacion || '',
      tipo: reserva.tipo || '',
      capacidad: reserva.capacidad || '',
      equipamiento: Array.isArray(reserva.equipamiento) ? reserva.equipamiento : [],
      fecha: this.obtenerFechaManana(),
      horaInicio: partesHora[0] || '09:00',
      horaFin: partesHora[1] || '10:00',
      invitadosInternos: Array.isArray(reserva.invitadosInternos) ? reserva.invitadosInternos : [],
      invitadosExternos: Array.isArray(reserva.invitadosExternos) ? reserva.invitadosExternos : [],
      conInvitados: reserva.externos === true,
      externos: reserva.externos === true,
      epp: reserva.epp === true,
      estadoEpp: reserva.estadoEpp || '',
      checkin: 'Sin check-in',
      mostrarQr: true
    };

    sessionStorage.setItem('sc_reserva_borrador', JSON.stringify(borrador));
    this.router.navigate(['/reserva-detalle']);
  }

  obtenerFechaManana() {
    const fecha = new Date();

    fecha.setDate(fecha.getDate() + 1);

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }
}
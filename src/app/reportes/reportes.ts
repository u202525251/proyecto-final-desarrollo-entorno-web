import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit, AfterViewInit {
  periodoSeleccionado: string = 'todos';
  sedeSeleccionada: string = 'todas';
  tipoSeleccionado: string = 'todas';

  cargando: boolean = false;

  salas: any[] = [];
  reservas: any[] = [];

  periodos: any[] = [];

  kpis: any[] = [];

  ocupacionPorSala: any[] = [];

  visitantes = {
    corporativo: 0,
    cliente: 0,
    proveedor: 0,
    externo: 0,
    total: 0
  };

  donutStyle: string = '';

  subtituloOcupacion: string = '';
  subtituloVisitantes: string = '';

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
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

  cargarDatos() {
    this.cargando = true;

    this.sessionService.getSalas().subscribe({
      next: (salasData: any[]) => {
        this.salas = (salasData || []).map((sala: any) => this.normalizarSala(sala));

        this.sessionService.getTodasLasReservas().subscribe({
          next: (reservasData: any[]) => {
            this.reservas = (reservasData || []).map((reserva: any) => this.normalizarReserva(reserva));

            this.periodos = this.obtenerPeriodos();
            this.renderReportes();

            this.cargando = false;
            this.cdr.detectChanges();
            this.cargarIconos();
          },
          error: (err: any) => {
            console.error('Error al cargar reservas para reportes', err);
            this.reservas = [];
            this.periodos = this.obtenerPeriodos();
            this.renderReportes();

            this.cargando = false;
            alert('No se pudieron cargar las reservas para reportes.');
          }
        });
      },
      error: (err: any) => {
        console.error('Error al cargar salas para reportes', err);
        this.salas = [];
        this.reservas = [];
        this.periodos = this.obtenerPeriodos();
        this.renderReportes();

        this.cargando = false;
        alert('No se pudieron cargar las salas para reportes.');
      }
    });
  }

  normalizarSala(sala: any) {
    return {
      ...sala,
      id_sala: sala.id_sala || '',
      nombre: sala.nombre || sala.nombre_sala || 'Sala no registrada',
      sede: sala.sede || '',
      ubicacion: sala.ubicacion || '',
      tipo: sala.tipo || 'regular',
      capacidad: Number(sala.capacidad || 0),
      estado: sala.estado || 'habilitada',
      equipamiento: Array.isArray(sala.equipamiento) ? sala.equipamiento : []
    };
  }

  normalizarReserva(reserva: any) {
    return {
      ...reserva,
      id_reserva: reserva.id_reserva || reserva.id || '',
      titulo: reserva.titulo || 'Reserva sin título',
      fecha: reserva.fecha || '',
      hora: reserva.hora || '',
      lugar: reserva.lugar || reserva.sala || 'Sala no registrada',
      id_sala: reserva.id_sala || '',
      estado: reserva.estado || 'confirmada',
      externos: reserva.externos === true,
      cantidadInternos: Number(reserva.cantidadInternos || 0),
      cantidadExternos: Number(reserva.cantidadExternos || 0),
      epp: reserva.epp === true,
      invitadosInternos: Array.isArray(reserva.invitadosInternos) ? reserva.invitadosInternos : [],
      invitadosExternos: Array.isArray(reserva.invitadosExternos) ? reserva.invitadosExternos : [],
      organizador: reserva.organizador || {}
    };
  }

  obtenerPeriodos() {
    const mapa = new Map<string, string>();

    this.reservas.forEach((reserva: any) => {
      if (!reserva.fecha || reserva.fecha.length < 7) {
        return;
      }

      const valor = reserva.fecha.substring(0, 7);
      mapa.set(valor, this.formatearPeriodo(valor));
    });

    const lista = Array.from(mapa.entries())
      .map(([valor, texto]) => {
        return {
          valor: valor,
          texto: texto
        };
      })
      .sort((a: any, b: any) => b.valor.localeCompare(a.valor));

    return [
      {
        valor: 'todos',
        texto: 'Todos los periodos'
      },
      ...lista
    ];
  }

  formatearPeriodo(valor: string) {
    const partes = valor.split('-');

    if (partes.length !== 2) {
      return valor;
    }

    const anio = partes[0];
    const mes = partes[1];

    const meses: any = {
      '01': 'Enero',
      '02': 'Febrero',
      '03': 'Marzo',
      '04': 'Abril',
      '05': 'Mayo',
      '06': 'Junio',
      '07': 'Julio',
      '08': 'Agosto',
      '09': 'Setiembre',
      '10': 'Octubre',
      '11': 'Noviembre',
      '12': 'Diciembre'
    };

    return `${meses[mes] || mes} ${anio}`;
  }

  renderReportes() {
    const salasFiltradas = this.obtenerSalasFiltradas();
    const reservasFiltradas = this.obtenerReservasFiltradas(salasFiltradas);

    this.ocupacionPorSala = this.calcularOcupacionPorSala(salasFiltradas, reservasFiltradas);
    this.visitantes = this.calcularVisitantes(reservasFiltradas);

    const totalReservas = reservasFiltradas.length;

    const tasaOcupacion = this.ocupacionPorSala.length > 0
      ? Math.round(
          this.ocupacionPorSala.reduce((total: number, item: any) => total + item.porcentaje, 0) /
          this.ocupacionPorSala.length
        )
      : 0;

    const totalVisitantes = this.visitantes.total;

    const promedioAsistentes = totalReservas > 0
      ? (
          reservasFiltradas.reduce((total: number, reserva: any) => {
            return total + this.contarAsistentes(reserva);
          }, 0) / totalReservas
        ).toFixed(1)
      : '0.0';

    this.kpis = [
      {
        label: 'Reservas del periodo',
        value: totalReservas,
        trend: this.calcularTendenciaSimple(totalReservas),
        icon: 'calendar',
        color: 'indigo'
      },
      {
        label: 'Tasa de ocupación',
        value: tasaOcupacion + '%',
        trend: this.calcularTendenciaSimple(tasaOcupacion),
        icon: 'trending-up',
        color: 'emerald'
      },
      {
        label: 'Visitantes registrados',
        value: totalVisitantes,
        trend: this.calcularTendenciaSimple(totalVisitantes),
        icon: 'user-check',
        color: 'amber'
      },
      {
        label: 'Promedio asistentes',
        value: promedioAsistentes,
        trend: this.calcularTendenciaDecimal(Number(promedioAsistentes)),
        icon: 'building-2',
        color: 'rose'
      }
    ];

    this.subtituloOcupacion =
      `Porcentaje de uso promedio · ${this.getTextoTipo()} · ${this.getTextoPeriodo()}`;

    this.subtituloVisitantes =
      `Distribución · ${this.getTextoTipo()} · ${this.getTextoPeriodo()}`;

    this.donutStyle = this.construirDonutStyle();

    this.cdr.detectChanges();
    this.cargarIconos();
  }

  obtenerSalasFiltradas() {
    return this.salas.filter((sala: any) => {
      const cumpleSede =
        this.sedeSeleccionada === 'todas' || sala.sede === this.sedeSeleccionada;

      const cumpleTipo =
        this.tipoSeleccionado === 'todas' || sala.tipo === this.tipoSeleccionado;

      return cumpleSede && cumpleTipo;
    });
  }

  obtenerReservasFiltradas(salasFiltradas: any[]) {
    const idsSalas = salasFiltradas.map((sala: any) => String(sala.id_sala || '').toLowerCase());
    const nombresSalas = salasFiltradas.map((sala: any) => String(sala.nombre || '').toLowerCase());

    return this.reservas.filter((reserva: any) => {
      const cumplePeriodo =
        this.periodoSeleccionado === 'todos' ||
        String(reserva.fecha || '').startsWith(this.periodoSeleccionado);

      const idReserva = String(reserva.id_sala || '').toLowerCase();
      const lugarReserva = String(reserva.lugar || '').toLowerCase();

      const perteneceASalas =
        idsSalas.includes(idReserva) ||
        nombresSalas.includes(lugarReserva);

      return cumplePeriodo && perteneceASalas;
    });
  }

  calcularOcupacionPorSala(salasFiltradas: any[], reservasFiltradas: any[]) {
    const resultado = salasFiltradas.map((sala: any) => {
      const reservasSala = reservasFiltradas.filter((reserva: any) => {
        const mismoId =
          String(reserva.id_sala || '').toLowerCase() === String(sala.id_sala || '').toLowerCase();

        const mismoNombre =
          String(reserva.lugar || '').toLowerCase() === String(sala.nombre || '').toLowerCase();

        return mismoId || mismoNombre;
      });

      const minutosReservados = reservasSala.reduce((total: number, reserva: any) => {
        return total + this.obtenerDuracionMinutos(reserva.hora);
      }, 0);

      const horasReservadas = minutosReservados / 60;

      const baseHoras = this.obtenerBaseHorasPeriodo();

      const porcentaje = baseHoras > 0
        ? Math.min(100, Math.round((horasReservadas / baseHoras) * 100))
        : 0;

      return {
        sala: sala.nombre.replace('Sala ', '').replace('Phone ', 'Ph.'),
        nombreCompleto: sala.nombre,
        reservas: reservasSala.length,
        horas: horasReservadas,
        porcentaje: porcentaje
      };
    });

    return resultado
      .filter((item: any) => item.reservas > 0 || this.periodoSeleccionado === 'todos')
      .sort((a: any, b: any) => b.porcentaje - a.porcentaje)
      .slice(0, 8);
  }

  obtenerBaseHorasPeriodo() {
    if (this.periodoSeleccionado === 'todos') {
      return 160;
    }

    const partes = this.periodoSeleccionado.split('-');

    if (partes.length !== 2) {
      return 160;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);

    const dias = new Date(anio, mes, 0).getDate();

    return dias * 8;
  }

  obtenerDuracionMinutos(hora: string) {
    const partes = String(hora || '').split(' - ');

    if (partes.length !== 2) {
      return 60;
    }

    const inicio = this.convertirHoraAMinutos(partes[0]);
    const fin = this.convertirHoraAMinutos(partes[1]);

    if (inicio === null || fin === null || fin <= inicio) {
      return 60;
    }

    return fin - inicio;
  }

  convertirHoraAMinutos(hora: string): number | null {
    const partes = String(hora || '').split(':');

    if (partes.length < 2) {
      return null;
    }

    const h = Number(partes[0]);
    const m = Number(partes[1]);

    if (Number.isNaN(h) || Number.isNaN(m)) {
      return null;
    }

    return h * 60 + m;
  }

  calcularVisitantes(reservasFiltradas: any[]) {
    let corporativo = 0;
    let cliente = 0;
    let proveedor = 0;
    let externo = 0;

    reservasFiltradas.forEach((reserva: any) => {
      corporativo += 1;
      corporativo += Array.isArray(reserva.invitadosInternos) ? reserva.invitadosInternos.length : 0;

      const invitadosExternos = Array.isArray(reserva.invitadosExternos)
        ? reserva.invitadosExternos
        : [];

      invitadosExternos.forEach((item: any) => {
        const tipo = String(item.tipo || 'externo').toLowerCase();

        if (tipo === 'cliente') {
          cliente++;
        } else if (tipo === 'proveedor') {
          proveedor++;
        } else {
          externo++;
        }
      });
    });

    return {
      corporativo: corporativo,
      cliente: cliente,
      proveedor: proveedor,
      externo: externo,
      total: corporativo + cliente + proveedor + externo
    };
  }

  contarAsistentes(reserva: any) {
    const internos = Array.isArray(reserva.invitadosInternos)
      ? reserva.invitadosInternos.length
      : 0;

    const externos = Array.isArray(reserva.invitadosExternos)
      ? reserva.invitadosExternos.length
      : 0;

    return 1 + internos + externos;
  }

  calcularTendenciaSimple(valor: number) {
    if (valor === 0) {
      return '0%';
    }

    if (valor >= 10) {
      return '+12%';
    }

    if (valor >= 5) {
      return '+7%';
    }

    return '+3%';
  }

  calcularTendenciaDecimal(valor: number) {
    if (valor === 0) {
      return '0.0';
    }

    if (valor >= 5) {
      return '+0.8';
    }

    return '+0.3';
  }

  getTextoPeriodo() {
    const periodo = this.periodos.find((item: any) => item.valor === this.periodoSeleccionado);
    return periodo ? periodo.texto : 'Todos los periodos';
  }

  getTextoTipo() {
    if (this.tipoSeleccionado === 'premium') {
      return 'Premium';
    }

    if (this.tipoSeleccionado === 'regular') {
      return 'Regular';
    }

    if (this.tipoSeleccionado === 'phonebooth') {
      return 'Phone Booth';
    }

    return 'Todas las salas';
  }

  construirDonutStyle() {
    const total = this.visitantes.total;

    if (total === 0) {
      return 'conic-gradient(#e8e8ee 0deg 360deg)';
    }

    const p1 = Math.round((this.visitantes.corporativo / total) * 360);
    const p2 = Math.round((this.visitantes.cliente / total) * 360);
    const p3 = Math.round((this.visitantes.proveedor / total) * 360);
    const p4 = 360 - p1 - p2 - p3;

    const a1 = p1;
    const a2 = p1 + p2;
    const a3 = p1 + p2 + p3;
    const a4 = a3 + p4;

    return `
      conic-gradient(
        #818cf8 0deg ${a1}deg,
        #fbbf24 ${a1}deg ${a2}deg,
        #34d399 ${a2}deg ${a3}deg,
        #f472b6 ${a3}deg ${a4}deg
      )
    `;
  }

  getPorcentajeVisitante(cantidad: number) {
    if (this.visitantes.total === 0) {
      return 0;
    }

    return Math.round((cantidad / this.visitantes.total) * 100);
  }

  esTendenciaPositiva(tendencia: string) {
    return !String(tendencia || '').startsWith('-');
  }
}
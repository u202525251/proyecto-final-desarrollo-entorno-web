import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-mis-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reuniones.html',
  styleUrl: './mis-reuniones.css'
})
export class MisReuniones implements OnInit, AfterViewInit {
  filtro: string = 'todas';

  reservas: any[] = [];
  cargando: boolean = false;

  qrVisible: boolean = false;
  reservaQR: any = null;
  qrHtml: SafeHtml = '';
  qrTexto: string = '';

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit() {
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
    const user = this.sessionService.getUser();

    if (!user || !user.correo) {
      this.reservas = [];
      return;
    }

    this.cargando = true;

    this.sessionService.getMisReservas(user.correo).subscribe({
      next: (data: any[]) => {
        this.reservas = (data || []).map((item: any) => this.normalizarReserva(item));

        this.reservas = this.reservas.sort((a: any, b: any) => {
          const fechaA = `${a.fecha || ''} ${a.hora || ''}`;
          const fechaB = `${b.fecha || ''} ${b.hora || ''}`;
          return fechaB.localeCompare(fechaA);
        });

        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al cargar reservas', err);
        this.reservas = [];
        this.cargando = false;
        alert('No se pudieron cargar las reservas.');
      }
    });
  }

  normalizarReserva(item: any) {
    const idReserva = item.id_reserva || item.id || '';

    const reserva = {
      ...item,
      id_reserva: idReserva,
      titulo: item.titulo || 'Reserva sin título',
      fecha: item.fecha || '',
      hora: item.hora || '',
      lugar: item.lugar || item.sala || 'Sala no registrada',
      id_sala: item.id_sala || '',
      estado: item.estado || 'confirmada',
      checkin: item.checkin || 'Sin check-in',
      cantidadInternos: Number(item.cantidadInternos || 0),
      cantidadExternos: Number(item.cantidadExternos || 0),
      externos: item.externos === true,
      epp: item.epp === true,
      estadoEpp: item.estadoEpp || '',
      mostrarQr: item.mostrarQr !== false,
      organizador: item.organizador || this.sessionService.getUser(),
      invitadosInternos: Array.isArray(item.invitadosInternos) ? item.invitadosInternos : [],
      invitadosExternos: Array.isArray(item.invitadosExternos) ? item.invitadosExternos : []
    };

    reserva.futura = this.esReservaFutura(reserva);

    return reserva;
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

  get reservasFiltradas() {
    if (this.filtro === 'todas') {
      return this.reservas;
    }

    if (this.filtro === 'futuras') {
      return this.reservas.filter((r: any) => r.futura);
    }

    if (this.filtro === 'pasadas') {
      return this.reservas.filter((r: any) => !r.futura);
    }

    if (this.filtro === 'externos') {
      return this.reservas.filter((r: any) => r.externos);
    }

    if (this.filtro === 'epp') {
      return this.reservas.filter((r: any) => r.epp);
    }

    return this.reservas;
  }

  cambiarFiltro() {
    this.cdr.detectChanges();
    this.cargarIconos();
  }

  getParticipantes(reserva: any) {
    const lista = [];

    const organizador = reserva.organizador || this.sessionService.getUser();

    if (organizador) {
      lista.push({
        nombre: organizador.nombre || 'Usuario',
        correo: organizador.correo || '',
        tipo: 'interno',
        esOrganizador: true
      });
    }

    if (Array.isArray(reserva.invitadosInternos)) {
      reserva.invitadosInternos.forEach((item: any) => {
        lista.push({
          ...item,
          tipo: 'interno',
          esOrganizador: false
        });
      });
    }

    if (Array.isArray(reserva.invitadosExternos)) {
      reserva.invitadosExternos.forEach((item: any) => {
        lista.push({
          ...item,
          tipo: item.tipo || 'externo',
          esOrganizador: false
        });
      });
    }

    return lista;
  }

  getParticipantRoleLabel(item: any) {
    if (item.esOrganizador) {
      return 'Organizador';
    }

    if (item.tipo === 'interno') {
      return 'Interno corporativo';
    }

    if (item.tipo === 'cliente') {
      return 'Cliente';
    }

    if (item.tipo === 'proveedor') {
      return 'Proveedor';
    }

    return 'Corporativo externo';
  }

  getParticipantRoleClass(item: any) {
    if (item.esOrganizador) {
      return 'role-organizador';
    }

    if (item.tipo === 'interno') {
      return 'role-interno';
    }

    if (item.tipo === 'cliente') {
      return 'role-cliente';
    }

    if (item.tipo === 'proveedor') {
      return 'role-proveedor';
    }

    return 'role-externo';
  }

  mostrarQR(reserva: any) {
    this.reservaQR = reserva;

    const token = this.getReservationQrToken(reserva);

    this.qrTexto = `${reserva.titulo || 'Reserva'} · ${token}`;
    this.qrHtml = this.sanitizer.bypassSecurityTrustHtml(
      this.buildDemoQrSvg(token)
    );

    this.qrVisible = true;

    this.cdr.detectChanges();
    this.cargarIconos();
  }

  cerrarQR() {
    this.qrVisible = false;
    this.reservaQR = null;
    this.qrTexto = '';
    this.qrHtml = '';
  }

  editarReserva(reserva: any) {
    this.sessionService.getSalas().subscribe({
      next: (salas: any[]) => {
        const salaEncontrada = this.buscarSalaDeReserva(reserva, salas || []);
        this.irAEditarReserva(reserva, salaEncontrada);
      },
      error: (err: any) => {
        console.error('Error al cargar datos de sala para edición', err);

        // Si falla la consulta de salas, igual dejamos editar la reserva,
        // pero con la información básica que sí existe en la reserva.
        this.irAEditarReserva(reserva, null);
      }
    });
  }

  buscarSalaDeReserva(reserva: any, salas: any[]) {
    const idSalaReserva = String(reserva.id_sala || '').toLowerCase();
    const nombreSalaReserva = String(reserva.lugar || reserva.sala || '').toLowerCase();

    const salaPorId = salas.find((sala: any) => {
      return String(sala.id_sala || '').toLowerCase() === idSalaReserva;
    });

    if (salaPorId) {
      return salaPorId;
    }

    const salaPorNombre = salas.find((sala: any) => {
      return String(sala.nombre || sala.nombre_sala || '').toLowerCase() === nombreSalaReserva;
    });

    return salaPorNombre || null;
  }

  irAEditarReserva(reserva: any, salaEncontrada: any) {
    const partesHora = String(reserva.hora || '').split(' - ');

    const horaInicio = partesHora[0] || '09:00';
    const horaFin = partesHora[1] || '10:00';

    const nombreSala =
      salaEncontrada?.nombre ||
      salaEncontrada?.nombre_sala ||
      reserva.lugar ||
      reserva.sala ||
      'Sala no registrada';

    const idSala =
      salaEncontrada?.id_sala ||
      reserva.id_sala ||
      '';

    const sedeKey =
      salaEncontrada?.sede ||
      reserva.sedeKey ||
      reserva.sede ||
      '';

    const sedeTexto =
      sedeKey === 'almacen'
        ? 'Almacén'
        : sedeKey === 'oficinas'
          ? 'Oficinas'
          : reserva.sede || '';

    const borradorEdicion = {
      modoEdicion: true,
      editReservaId: reserva.id_reserva,

      titulo: reserva.titulo || '',

      sala: nombreSala,
      id_sala: idSala,

      sede: sedeTexto,
      sedeKey: sedeKey,

      ubicacion: salaEncontrada?.ubicacion || reserva.ubicacion || '',
      tipo: salaEncontrada?.tipo || reserva.tipo || '',
      capacidad: salaEncontrada?.capacidad || reserva.capacidad || '',
      equipamiento: Array.isArray(salaEncontrada?.equipamiento)
        ? salaEncontrada.equipamiento
        : Array.isArray(reserva.equipamiento)
          ? reserva.equipamiento
          : [],

      fecha: reserva.fecha || '',
      horaInicio: horaInicio,
      horaFin: horaFin,

      organizador: reserva.organizador || this.sessionService.getUser(),

      invitadosInternos: Array.isArray(reserva.invitadosInternos)
        ? reserva.invitadosInternos
        : [],

      invitadosExternos: Array.isArray(reserva.invitadosExternos)
        ? reserva.invitadosExternos
        : [],

      conInvitados: reserva.externos === true,

      externos: reserva.externos === true,
      cantidadInternos: reserva.cantidadInternos || 0,
      cantidadExternos: reserva.cantidadExternos || 0,

      epp: reserva.epp === true || sedeKey === 'almacen',
      estadoEpp: reserva.estadoEpp || '',
      checkin: reserva.checkin || 'Sin check-in',
      mostrarQr: reserva.mostrarQr !== false
    };

    sessionStorage.setItem(
      'sc_reserva_borrador',
      JSON.stringify(borradorEdicion)
    );

    this.router.navigate(['/reserva-detalle']);
  }

  eliminarReserva(reserva: any) {
    const confirmar = confirm(
      '¿Deseas eliminar la reserva "' + reserva.titulo + '"?'
    );

    if (!confirmar) {
      return;
    }

    this.sessionService.eliminarReservaApi(reserva.id_reserva).subscribe({
      next: (res: any) => {
        this.reservas = this.reservas.filter(
          (item: any) => item.id_reserva !== reserva.id_reserva
        );

        alert(res?.mensaje || 'Reserva eliminada correctamente');

        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al eliminar reserva', err);
        alert('No se pudo eliminar la reserva.');
      }
    });
  }

  getReservationQrToken(reserva: any) {
    const seed = [
      reserva.id_reserva || '0',
      reserva.titulo || 'reserva',
      reserva.fecha || '',
      reserva.hora || '',
      reserva.lugar || ''
    ].join('|');

    let hash = 0;

    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) >>> 0;
    }

    return `SC-${String(hash).padStart(10, '0')}`;
  }

  buildDemoQrSvg(seedText: string) {
    let seed = 0;

    for (let i = 0; i < seedText.length; i++) {
      seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    }

    function rand() {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    const size = 21;
    const cell = 7;
    const quiet = 2;
    const occupied = new Set<string>();
    const rects: string[] = [];

    function mark(x: number, y: number, w: number, h: number) {
      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          occupied.add(`${xx},${yy}`);
        }
      }
    }

    function finder(x: number, y: number) {
      rects.push(`<rect x="${(x + quiet) * cell}" y="${(y + quiet) * cell}" width="${7 * cell}" height="${7 * cell}" rx="6" fill="#111827"/>`);
      rects.push(`<rect x="${(x + quiet + 1) * cell}" y="${(y + quiet + 1) * cell}" width="${5 * cell}" height="${5 * cell}" rx="5" fill="#ffffff"/>`);
      rects.push(`<rect x="${(x + quiet + 2) * cell}" y="${(y + quiet + 2) * cell}" width="${3 * cell}" height="${3 * cell}" rx="4" fill="#111827"/>`);
      mark(x, y, 7, 7);
    }

    finder(0, 0);
    finder(size - 7, 0);
    finder(0, size - 7);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (occupied.has(`${x},${y}`)) {
          continue;
        }

        if (rand() > 0.56) {
          rects.push(`<rect x="${(x + quiet) * cell}" y="${(y + quiet) * cell}" width="${cell}" height="${cell}" rx="2" fill="#111827"/>`);
        }
      }
    }

    const total = (size + quiet * 2) * cell;

    return `<svg viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img"><rect width="${total}" height="${total}" rx="18" fill="#ffffff"/>${rects.join('')}</svg>`;
  }
}
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-reserva-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva-detalle.html',
  styleUrl: './reserva-detalle.css'
})
export class ReservaDetalle implements OnInit, AfterViewInit {
  reserva: any = {};
  usuario: any = null;

  tituloReunion: string = '';
  fecha: string = '';
  horaInicio: string = '';
  horaFin: string = '';

  conInvitadosExternos: boolean = false;

  invitadosInternos: any[] = [];
  busquedaInterno: string = '';
  resultadosInternos: any[] = [];
  buscandoInternos: boolean = false;

  invitadosExternos: any[] = [];
  externoNombre: string = '';
  externoDocumento: string = '';
  externoEmpresa: string = '';
  externoTipo: string = 'cliente';

  reservasExistentes: any[] = [];

  estadoDisponibilidad: string = 'conflicto';
  mensajeDisponibilidad: string = 'Completa la fecha y el horario para validar disponibilidad.';
  conflictos: any[] = [];
  horariosAlternativos: string[] = [];
  salasEquivalentes: string[] = [];

  guardando: boolean = false;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.sessionService.getUser();

    const data = sessionStorage.getItem('sc_reserva_borrador');

    if (!data) {
      alert('No se encontró una sala seleccionada.');
      this.router.navigate(['/reservas']);
      return;
    }

    this.reserva = JSON.parse(data);

    this.tituloReunion = this.reserva.titulo || '';
    this.fecha = this.reserva.fecha || '';
    this.horaInicio = this.reserva.horaInicio || '09:00';
    this.horaFin = this.reserva.horaFin || '10:00';

    this.invitadosInternos = Array.isArray(this.reserva.invitadosInternos)
      ? this.reserva.invitadosInternos
      : [];

    this.invitadosExternos = Array.isArray(this.reserva.invitadosExternos)
      ? this.reserva.invitadosExternos
      : [];

    this.conInvitadosExternos =
      this.reserva.conInvitados === true ||
      this.reserva.externos === true ||
      this.invitadosExternos.length > 0;

    this.cargarReservasExistentes();
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

  volver() {
    this.router.navigate(['/mis-reuniones']);
  }

  cargarReservasExistentes() {
    this.sessionService.getTodasLasReservas().subscribe({
      next: (data: any[]) => {
        this.reservasExistentes = data || [];
        this.validarDisponibilidad();
      },
      error: (err: any) => {
        console.error('Error al cargar reservas existentes', err);
        this.reservasExistentes = [];
        this.validarDisponibilidad();
      }
    });
  }

  toMin(hora: string): number | null {
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

  parseRango(hora: string) {
    const partes = String(hora || '').split(' - ');

    return {
      inicio: this.toMin(partes[0] || ''),
      fin: this.toMin(partes[1] || '')
    };
  }

  validarDisponibilidad() {
    const inicioSeleccionado = this.toMin(this.horaInicio);
    const finSeleccionado = this.toMin(this.horaFin);

    this.conflictos = [];
    this.horariosAlternativos = [];
    this.salasEquivalentes = [];

    if (!this.fecha || inicioSeleccionado === null || finSeleccionado === null || finSeleccionado <= inicioSeleccionado) {
      this.estadoDisponibilidad = 'conflicto';
      this.mensajeDisponibilidad = 'Verifica que la fecha y el rango horario sean correctos.';
      this.cdr.detectChanges();
      this.cargarIconos();
      return;
    }

    this.conflictos = this.reservasExistentes.filter((item: any) => {
      const mismaReservaEnEdicion =
        this.reserva.modoEdicion === true &&
        item.id_reserva === this.reserva.editReservaId;

      if (mismaReservaEnEdicion) {
        return false;
      }

      const mismaSala =
        item.id_sala === this.reserva.id_sala ||
        item.lugar === this.reserva.sala;

      const mismaFecha = item.fecha === this.fecha;

      const rango = this.parseRango(item.hora);

      if (!mismaSala || !mismaFecha || rango.inicio === null || rango.fin === null) {
        return false;
      }

      return inicioSeleccionado < rango.fin && finSeleccionado > rango.inicio;
    });

    if (this.conflictos.length === 0) {
      this.estadoDisponibilidad = 'disponible';
      this.mensajeDisponibilidad = 'La sala está disponible para la fecha y el horario seleccionados.';
    } else {
      this.estadoDisponibilidad = 'conflicto';
      this.mensajeDisponibilidad = 'Ya existe una reserva para esta sala en ese rango de tiempo.';
      this.horariosAlternativos = this.generarHorariosAlternativos();
      this.salasEquivalentes = ['Sala equivalente disponible', 'Otra sala de la misma sede'];
    }

    this.guardarBorrador();
    this.cdr.detectChanges();
    this.cargarIconos();
  }

  generarHorariosAlternativos(): string[] {
    const inicio = this.toMin(this.horaInicio);
    const fin = this.toMin(this.horaFin);

    if (inicio === null || fin === null || fin <= inicio) {
      return ['10:00 - 11:00', '14:00 - 15:00'];
    }

    const duracion = fin - inicio;

    const alternativa1Inicio = fin + 30;
    const alternativa1Fin = alternativa1Inicio + duracion;

    const alternativa2Inicio = inicio + 120;
    const alternativa2Fin = alternativa2Inicio + duracion;

    return [
      this.formatearRango(alternativa1Inicio, alternativa1Fin),
      this.formatearRango(alternativa2Inicio, alternativa2Fin)
    ];
  }

  formatearRango(inicio: number, fin: number): string {
    return `${this.formatearHora(inicio)} - ${this.formatearHora(fin)}`;
  }

  formatearHora(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  aplicarHorarioSugerido(rango: string) {
    const partes = rango.split(' - ');

    this.horaInicio = partes[0];
    this.horaFin = partes[1];

    this.validarDisponibilidad();
  }

  guardarBorrador() {
    const borrador = {
      ...this.reserva,
      titulo: this.tituloReunion,
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      invitadosInternos: this.invitadosInternos,
      invitadosExternos: this.invitadosExternos,
      conInvitados: this.conInvitadosExternos,
      externos: this.conInvitadosExternos,
      cantidadInternos: this.invitadosInternos.length,
      cantidadExternos: this.invitadosExternos.length
    };

    sessionStorage.setItem('sc_reserva_borrador', JSON.stringify(borrador));
    this.reserva = borrador;
  }

  buscarInternos() {
    const texto = this.busquedaInterno.trim();

    if (texto.length < 2) {
      this.resultadosInternos = [];
      this.buscandoInternos = false;
      return;
    }

    this.buscandoInternos = true;

    this.sessionService.buscarUsuariosAD(texto).subscribe({
      next: (data: any[]) => {
        const correosAgregados = this.invitadosInternos.map(
          (i: any) => String(i.correo || '').toLowerCase()
        );

        this.resultadosInternos = (data || []).filter((item: any) => {
          const correo = String(item.correo || '').toLowerCase();
          const correoUsuario = String(this.usuario?.correo || '').toLowerCase();

          return !correosAgregados.includes(correo) && correo !== correoUsuario;
        });

        this.buscandoInternos = false;
        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al buscar internos', err);
        this.resultadosInternos = [];
        this.buscandoInternos = false;
      }
    });
  }

  agregarInterno(usuario: any) {
    this.invitadosInternos = [
      ...this.invitadosInternos,
      {
        correo: usuario.correo,
        nombre: usuario.nombre,
        cargo: usuario.cargo,
        sede: usuario.sede,
        tipo: 'interno'
      }
    ];

    this.busquedaInterno = '';
    this.resultadosInternos = [];

    this.guardarBorrador();
    this.cargarIconos();
  }

  quitarInterno(correo: string) {
    this.invitadosInternos = this.invitadosInternos.filter(
      (item: any) => String(item.correo).toLowerCase() !== String(correo).toLowerCase()
    );

    this.guardarBorrador();
    this.cargarIconos();
  }

  sincronizarInvitadosExternos() {
    if (!this.conInvitadosExternos) {
      this.invitadosExternos = [];
    }

    this.guardarBorrador();
    this.cargarIconos();
  }

  agregarExterno() {
    if (!this.conInvitadosExternos) {
      this.conInvitadosExternos = true;
    }

    if (this.externoNombre.trim() === '') {
      alert('Ingresa el nombre del invitado externo.');
      return;
    }

    this.invitadosExternos = [
      ...this.invitadosExternos,
      {
        nombre: this.externoNombre.trim(),
        documento: this.externoDocumento.trim(),
        empresa: this.externoEmpresa.trim(),
        tipo: this.externoTipo
      }
    ];

    this.externoNombre = '';
    this.externoDocumento = '';
    this.externoEmpresa = '';
    this.externoTipo = 'cliente';

    this.guardarBorrador();
    this.cargarIconos();
  }

  quitarExterno(index: number) {
    this.invitadosExternos = this.invitadosExternos.filter(
      (_: any, i: number) => i !== index
    );

    this.guardarBorrador();
    this.cargarIconos();
  }

  validarFormulario(): boolean {
    if (this.tituloReunion.trim() === '') {
      alert('Ingresa un nombre de reunión para continuar.');
      return false;
    }

    if (!this.fecha) {
      alert('Selecciona la fecha de la reunión.');
      return false;
    }

    if (!this.horaInicio || !this.horaFin) {
      alert('Selecciona la hora inicio y hora fin.');
      return false;
    }

    if (this.horaFin <= this.horaInicio) {
      alert('La hora fin debe ser mayor que la hora inicio.');
      return false;
    }

    if (this.estadoDisponibilidad !== 'disponible') {
      alert('No puedes guardar porque la sala no está disponible en ese horario.');
      return false;
    }

    return true;
  }

  guardarReserva() {
    this.validarDisponibilidad();

    if (!this.validarFormulario()) {
      return;
    }

    this.guardarBorrador();

    this.guardando = true;

    const hora = `${this.horaInicio} - ${this.horaFin}`;

    const esEdicion = this.reserva.modoEdicion === true;

    const idReserva = esEdicion
      ? this.reserva.editReservaId
      : `RES-${Date.now()}`;

    const reservaApi = {
      id_reserva: idReserva,

      titulo: this.tituloReunion.trim(),
      fecha: this.fecha,
      hora: hora,

      lugar: this.reserva.sala,
      id_sala: this.reserva.id_sala || '',

      estado: 'confirmada',

      organizador: {
        correo: this.usuario?.correo || '',
        nombre: this.usuario?.nombre || 'Usuario',
        rol: this.usuario?.rol || ''
      },

      correo_organizador: this.usuario?.correo || '',

      invitadosInternos: this.invitadosInternos,
      invitadosExternos: this.invitadosExternos,

      externos: this.conInvitadosExternos,

      cantidadInternos: this.invitadosInternos.length,
      cantidadExternos: this.invitadosExternos.length,

      epp: this.reserva.epp === true || this.reserva.sedeKey === 'almacen',
      estadoEpp:
        this.reserva.epp === true || this.reserva.sedeKey === 'almacen'
          ? 'Pendiente recojo'
          : '',

      checkin: this.reserva.checkin || 'Sin check-in',
      mostrarQr: true,
      futura: true
    };

    if (esEdicion) {
      this.sessionService.actualizarReservaApi(
        idReserva,
        reservaApi
      ).subscribe({
        next: (res: any) => {
          this.guardando = false;
          sessionStorage.removeItem('sc_reserva_borrador');

          alert(res?.mensaje || 'Reserva actualizada correctamente');
          this.router.navigate(['/mis-reuniones']);
        },
        error: (err: any) => {
          console.error('Error al actualizar reserva', err);
          this.guardando = false;
          alert('No se pudo actualizar la reserva.');
        }
      });

      return;
    }

    this.sessionService.crearReservaApi(reservaApi).subscribe({
      next: (res: any) => {
        this.guardando = false;
        sessionStorage.removeItem('sc_reserva_borrador');

        alert(res?.mensaje || 'Reserva creada correctamente');
        this.router.navigate(['/mis-reuniones']);
      },
      error: (err: any) => {
        console.error('Error al guardar reserva', err);
        this.guardando = false;
        alert('No se pudo guardar la reserva.');
      }
    });
  }
}
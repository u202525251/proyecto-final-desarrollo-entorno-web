import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit, AfterViewInit {
  currentTab: string = 'epp';
  auditFilter: string = 'todos';

  eppCatalog: any[] = [];
  usuarios: any[] = [];
  policies: any = {
    maxDuracionHoras: 4,
    maxRepeticionMeses: 3
  };
  auditLog: any[] = [];

  newEppNombre: string = '';
  newEppStock: any = '';
  newEppMin: any = '';

  busquedaUsuario: string = '';
  resultadosAD: any[] = [];
  usuarioSeleccionadoAD: any = null;
  rolSeleccionado: string = 'Usuario';

  chartType: any = null;
  chartDaily: any = null;

  tabs = [
    { key: 'epp', label: 'EPP', icon: 'package' },
    { key: 'roles', label: 'Roles', icon: 'users' },
    { key: 'politicas', label: 'Políticas', icon: 'lock' },
    { key: 'auditoria', label: 'Auditoría', icon: 'activity' }
  ];

  filtrosAuditoria = [
    { key: 'todos', label: 'Todos' },
    { key: 'reserva', label: 'Reservas' },
    { key: 'epp', label: 'EPP' },
    { key: 'admin', label: 'Administración' }
  ];

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.eppCatalog = this.sessionService.getEppCatalog();
    this.cargarUsuariosSistema();
    this.policies = this.sessionService.getPolicies();
    this.auditLog = this.sessionService.getAuditLog();
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

  cargarUsuariosSistema() {
    this.sessionService.getUsuariosSistema().subscribe({
      next: (data: any[]) => {
        this.usuarios = [...data];
        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios del sistema', err);
        this.showToast('No se pudieron cargar los usuarios del sistema');
      }
    });
  }

  switchTab(tab: string) {
    this.currentTab = tab;
    this.cargarIconos();

    if (tab === 'roles') {
      this.cargarUsuariosSistema();
    }

    if (tab === 'auditoria') {
      this.cargarGraficos();
    }
  }

  buscarUsuarioAD() {
    const texto = this.busquedaUsuario.trim();

    if (texto.length < 2) {
      this.resultadosAD = [];
      this.usuarioSeleccionadoAD = null;
      this.cdr.detectChanges();
      return;
    }

    this.sessionService.buscarUsuariosAD(texto).subscribe({
      next: (data: any[]) => {
        this.resultadosAD = [...data];
        this.usuarioSeleccionadoAD = null;
        this.cdr.detectChanges();
        this.cargarIconos();
      },
      error: (err: any) => {
        console.error('Error al buscar usuarios AD', err);
        this.showToast('No se pudo buscar usuarios');
      }
    });
  }

  seleccionarUsuarioAD(usuario: any) {
    this.usuarioSeleccionadoAD = usuario;
    this.resultadosAD = [];
    this.busquedaUsuario = usuario.nombre;
    this.cdr.detectChanges();
    this.cargarIconos();
  }

  usuarioTieneAcceso(usuarioAD: any) {
    return this.usuarios.some(
      (u: any) => u.correo.toLowerCase() === usuarioAD.correo.toLowerCase()
    );
  }

  asignarRolAD() {
    if (!this.usuarioSeleccionadoAD) {
      this.showToast('Selecciona un usuario del AD');
      return;
    }

    if (this.usuarioTieneAcceso(this.usuarioSeleccionadoAD)) {
      this.showToast('El usuario ya tiene acceso al sistema');
      return;
    }

    const usuarioSeleccionado = this.usuarioSeleccionadoAD;
    const rolAsignado = this.rolSeleccionado;

    this.sessionService.asignarRolUsuarioAD(
      usuarioSeleccionado,
      rolAsignado
    ).subscribe({
      next: (res: any) => {
        const nuevoUsuario = {
          correo: usuarioSeleccionado.correo,
          nombre: usuarioSeleccionado.nombre,
          cargo: usuarioSeleccionado.cargo,
          sede: usuarioSeleccionado.sede,
          rol: rolAsignado,
          acceso: true
        };

        this.usuarios = [
          ...this.usuarios.filter(
            (u: any) => u.correo.toLowerCase() !== nuevoUsuario.correo.toLowerCase()
          ),
          nuevoUsuario
        ];

        this.busquedaUsuario = '';
        this.resultadosAD = [];
        this.usuarioSeleccionadoAD = null;
        this.rolSeleccionado = 'Usuario';

        this.cdr.detectChanges();
        this.showToast(res?.mensaje || 'Rol asignado correctamente');
        this.cargarIconos();

        setTimeout(() => {
          this.cargarUsuariosSistema();
        }, 300);
      },
      error: (err: any) => {
        console.error('Error al asignar rol', err);
        this.showToast('No se pudo asignar el rol');
      }
    });
  }

  changeRole(i: number, event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const usuario = this.usuarios[i];

    this.sessionService.actualizarRolUsuario(usuario.correo, val).subscribe({
      next: (res: any) => {
        const usuariosActualizados = [...this.usuarios];

        usuariosActualizados[i] = {
          ...usuariosActualizados[i],
          rol: val
        };

        this.usuarios = usuariosActualizados;

        this.cdr.detectChanges();
        this.showToast(res?.mensaje || 'Rol actualizado correctamente');
        this.cargarIconos();

        setTimeout(() => {
          this.cargarUsuariosSistema();
        }, 300);
      },
      error: (err: any) => {
        console.error('Error al actualizar rol', err);
        this.showToast('No se pudo actualizar el rol');

        setTimeout(() => {
          this.cargarUsuariosSistema();
        }, 300);
      }
    });
  }

  eliminarAccesoUsuario(i: number) {
    const usuario = this.usuarios[i];

    const confirmar = confirm(
      '¿Está seguro que desea eliminar el acceso de ' + usuario.nombre + ' al sistema?'
    );

    if (!confirmar) {
      return;
    }

    this.sessionService.eliminarAccesoUsuario(usuario.correo).subscribe({
      next: (res: any) => {
        this.usuarios = this.usuarios.filter(
          (u: any) => u.correo.toLowerCase() !== usuario.correo.toLowerCase()
        );

        this.resultadosAD = this.resultadosAD.map((u: any) => ({ ...u }));

        this.cdr.detectChanges();
        this.showToast(res?.mensaje || 'Acceso revocado correctamente');
        this.cargarIconos();

        setTimeout(() => {
          this.cargarUsuariosSistema();
        }, 300);
      },
      error: (err: any) => {
        console.error('Error al eliminar acceso', err);
        this.showToast('No se pudo eliminar el acceso');
      }
    });
  }

  getStockPct(ep: any) {
    if (ep.stockMinimo > 0) {
      return Math.min((ep.stock / (ep.stockMinimo * 2.5)) * 100, 100);
    }

    return 100;
  }

  getStockClass(ep: any) {
    if (ep.stock <= ep.stockMinimo * 0.5) {
      return 'critical';
    }

    if (ep.stock <= ep.stockMinimo) {
      return 'low';
    }

    return 'ok';
  }

  getBadgeClass(ep: any) {
    const cls = this.getStockClass(ep);

    if (cls === 'ok') {
      return 'badge-success';
    }

    if (cls === 'low') {
      return 'badge-warning';
    }

    return 'badge-info';
  }

  getStockLabel(ep: any) {
    const cls = this.getStockClass(ep);

    if (cls === 'ok') {
      return 'Normal';
    }

    if (cls === 'low') {
      return 'Bajo';
    }

    return 'Crítico';
  }

  editEpp(id: number) {
    const ep = this.eppCatalog.find(e => e.id === id);

    if (!ep) {
      return;
    }

    const val = prompt('Nuevo stock para ' + ep.nombre + ':', ep.stock);

    if (val !== null && !isNaN(+val)) {
      ep.stock = +val;
      this.sessionService.setEppCatalog(this.eppCatalog);
      this.showToast('Stock actualizado');
      this.cargarIconos();
    }
  }

  delEpp(id: number) {
    this.eppCatalog = this.eppCatalog.filter(e => e.id !== id);
    this.sessionService.setEppCatalog(this.eppCatalog);
    this.showToast('EPP eliminado');
    this.cargarIconos();
  }

  addEpp() {
    const n = this.newEppNombre;
    const s = +this.newEppStock;
    const m = +this.newEppMin;

    if (!n || !s) {
      return;
    }

    const id = Math.max(...this.eppCatalog.map(e => e.id), 0) + 1;

    this.eppCatalog.push({
      id: id,
      nombre: n,
      stock: s,
      stockMinimo: m || 5,
      enUso: 0,
      icono: '🦺'
    });

    this.sessionService.setEppCatalog(this.eppCatalog);

    this.newEppNombre = '';
    this.newEppStock = '';
    this.newEppMin = '';

    this.showToast('EPP agregado');
    this.cargarIconos();
  }

  savePolicies() {
    this.sessionService.setPolicies(this.policies);
    this.showToast('Políticas guardadas');
    this.cargarIconos();
  }

  setAuditFilter(f: string) {
    this.auditFilter = f;
    this.cargarIconos();
    this.cargarGraficos();
  }

  getFilteredAudit() {
    if (this.auditFilter === 'todos') {
      return this.auditLog;
    }

    return this.auditLog.filter(a => a.tipo === this.auditFilter);
  }

  getAuditIcon(tipo: string) {
    const iconMap: any = {
      reserva: 'calendar',
      epp: 'hard-hat',
      admin: 'settings'
    };

    return iconMap[tipo] || 'settings';
  }

  getAuditByType() {
    return [
      {
        n: 'Reservas',
        v: this.auditLog.filter(a => a.tipo === 'reserva').length,
        c: '#818cf8'
      },
      {
        n: 'EPP',
        v: this.auditLog.filter(a => a.tipo === 'epp').length,
        c: '#fbbf24'
      },
      {
        n: 'Admin',
        v: this.auditLog.filter(a => a.tipo === 'admin').length,
        c: '#34d399'
      }
    ];
  }

  getAuditByDay() {
    const days: any = {};

    this.auditLog.forEach(a => {
      const d = a.timestamp.split(' ')[0];
      days[d] = (days[d] || 0) + 1;
    });

    return Object.entries(days)
      .sort((a: any, b: any) => a[0].localeCompare(b[0]))
      .map((item: any) => ({
        fecha: item[0].slice(5),
        acciones: item[1]
      }));
  }

  cargarGraficos() {
    setTimeout(() => {
      const Chart = (window as any).Chart;

      if (!Chart) {
        return;
      }

      if (this.chartType) {
        this.chartType.destroy();
      }

      if (this.chartDaily) {
        this.chartDaily.destroy();
      }

      const byType = this.getAuditByType();
      const byDay = this.getAuditByDay();

      const ctxT = document.getElementById('chart-audit-type');
      const ctxD = document.getElementById('chart-audit-daily');

      if (ctxT) {
        this.chartType = new Chart(ctxT, {
          type: 'doughnut',
          data: {
            labels: byType.map(d => d.n),
            datasets: [
              {
                data: byType.map(d => d.v),
                backgroundColor: byType.map(d => d.c),
                borderWidth: 0,
                spacing: 3
              }
            ]
          },
          options: {
            responsive: true,
            cutout: '60%',
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }

      if (ctxD) {
        this.chartDaily = new Chart(ctxD, {
          type: 'line',
          data: {
            labels: byDay.map(d => d.fecha),
            datasets: [
              {
                data: byDay.map(d => d.acciones),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#6366f1'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }

      this.cargarIconos();
    }, 100);
  }

  showToast(msg: string) {
    let t = document.getElementById('global-toast');

    if (!t) {
      t = document.createElement('div');
      t.id = 'global-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }

    t.innerHTML =
      '<div class="toast-icon success"><i data-lucide="circle-check"></i></div>' +
      msg;

    t.style.display = 'flex';

    this.cargarIconos();

    setTimeout(() => {
      if (t) {
        t.style.display = 'none';
      }
    }, 2500);
  }
}
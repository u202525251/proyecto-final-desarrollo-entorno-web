import { AfterViewInit, Component, OnInit } from '@angular/core';
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
  policies: any = {};
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
    {
      key: 'epp',
      label: 'EPP',
      icon: 'package'
    },
    {
      key: 'roles',
      label: 'Roles',
      icon: 'users'
    },
    {
      key: 'politicas',
      label: 'Políticas',
      icon: 'lock'
    },
    {
      key: 'auditoria',
      label: 'Auditoría',
      icon: 'activity'
    }
  ];

  filtrosAuditoria = [
    {
      key: 'todos',
      label: 'Todos'
    },
    {
      key: 'reserva',
      label: 'Reservas'
    },
    {
      key: 'epp',
      label: 'EPP'
    },
    {
      key: 'admin',
      label: 'Administración'
    }
  ];

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.eppCatalog = this.sessionService.getEppCatalog();
    this.usuarios = this.sessionService.getUsuarios();
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

  switchTab(tab: string) {
    this.currentTab = tab;
    this.cargarIconos();

    if (tab === 'auditoria') {
      this.cargarGraficos();
    }
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

  buscarUsuarioAD() {
    this.resultadosAD = this.sessionService.buscarUsuariosAD(this.busquedaUsuario);
    this.usuarioSeleccionadoAD = null;
    this.cargarIconos();
  }

  seleccionarUsuarioAD(usuario: any) {
    this.usuarioSeleccionadoAD = usuario;
    this.resultadosAD = [];
    this.busquedaUsuario = usuario.nombre;
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

    this.sessionService.asignarRolUsuarioAD(
      this.usuarioSeleccionadoAD,
      this.rolSeleccionado
    );

    this.usuarios = this.sessionService.getUsuarios();

    this.busquedaUsuario = '';
    this.resultadosAD = [];
    this.usuarioSeleccionadoAD = null;
    this.rolSeleccionado = 'Usuario';

    this.showToast('Usuario agregado al sistema');
    this.cargarIconos();
  }

  changeRole(i: number, event: Event) {
    const val = (event.target as HTMLSelectElement).value;

    this.usuarios[i].rol = val;
    this.sessionService.setUsuarios(this.usuarios);
    this.showToast('Rol de ' + this.usuarios[i].nombre + ' actualizado a ' + val);
  }

  eliminarAccesoUsuario(i: number) {
    const usuario = this.usuarios[i];

    const confirmar = confirm(
      '¿Está seguro que desea eliminar el acceso de ' + usuario.nombre + ' al sistema?'
    );

    if (!confirmar) {
      return;
    }

    this.usuarios.splice(i, 1);
    this.sessionService.setUsuarios(this.usuarios);

    this.showToast('Acceso eliminado para ' + usuario.nombre);
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
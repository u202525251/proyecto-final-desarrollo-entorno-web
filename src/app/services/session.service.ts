import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private usuariosInit = [
    {
      correo: 'u202525251@upc.edu.pe',
      password: '123456',
      nombre: 'Bill Flores',
      rol: 'Administrador',
      cargo: 'Administrador de Operaciones',
      sede: 'Sede Principal — Oficinas'
    },
    {
      correo: 'U202419732@upc.edu.pe',
      password: '123456',
      nombre: 'Katya Iman Ccaihuari',
      rol: 'Administrador',
      cargo: 'Supervisor de TI',
      sede: 'San Borja'
    },
    {
      correo: 'alumno3@upc.edu.pe',
      password: '123456',
      nombre: 'Alumno 3',
      rol: 'Usuario',
      cargo: 'Analista Comercial',
      sede: 'Sede Principal — Oficinas'
    },
    {
      correo: 'alumno4@upc.edu.pe',
      password: '123456',
      nombre: 'Alumno 4',
      rol: 'Recepción',
      cargo: 'Supervisora de Almacén',
      sede: 'Almacén'
    }
  ];

  private usuariosADInit = [
    {
      correo: 'u202525251@upc.edu.pe',
      nombre: 'Bill Flores',
      cargo: 'Administrador de Operaciones',
      sede: 'Sede Principal — Oficinas'
    },
    {
      correo: 'U202419732@upc.edu.pe',
      nombre: 'Katya Iman Ccaihuari',
      cargo: 'Supervisor de TI',
      sede: 'San Borja'
    },
    {
      correo: 'alumno3@upc.edu.pe',
      nombre: 'Alumno 3',
      cargo: 'Analista Comercial',
      sede: 'Sede Principal — Oficinas'
    },
    {
      correo: 'alumno4@upc.edu.pe',
      nombre: 'Alumno 4',
      cargo: 'Supervisora de Almacén',
      sede: 'Almacén'
    },
    {
      correo: 'alumno5@upc.edu.pe',
      nombre: 'Alumno 5',
      cargo: 'Supervisora de Almacén',
      sede: 'Almacén'
    },
    {
      correo: 'alumno6@upc.edu.pe',
      nombre: 'Alumno 6',
      cargo: 'Supervisora de Almacén',
      sede: 'Almacén'
    }
  ];

  private eppCatalogInit = [
    {
      id: 1,
      nombre: 'Casco de seguridad',
      stock: 25,
      stockMinimo: 10,
      enUso: 8,
      icono: '🪖'
    },
    {
      id: 2,
      nombre: 'Lentes de protección',
      stock: 40,
      stockMinimo: 15,
      enUso: 12,
      icono: '🥽'
    },
    {
      id: 3,
      nombre: 'Zapatos punta de acero',
      stock: 7,
      stockMinimo: 8,
      enUso: 6,
      icono: '👞'
    },
    {
      id: 4,
      nombre: 'Chaleco reflectivo',
      stock: 30,
      stockMinimo: 12,
      enUso: 10,
      icono: '🦺'
    }
  ];

  private policiesDefault = {
    maxDuracionHoras: 4,
    maxRepeticionMeses: 3
  };

  private auditLogInit = [
    {
      id: 1,
      timestamp: '2026-03-11 09:15',
      usuario: 'Katya Imán',
      accion: 'Reserva creada',
      detalle: 'Sala Capacitación — 2026-03-12 10:00-12:00',
      tipo: 'reserva'
    },
    {
      id: 2,
      timestamp: '2026-03-11 09:18',
      usuario: 'Sistema',
      accion: 'EPP asignado',
      detalle: '3× Casco, 3× Lentes → Reunión #12',
      tipo: 'epp'
    },
    {
      id: 3,
      timestamp: '2026-03-10 16:42',
      usuario: 'Renzo Núñez',
      accion: 'Rol actualizado',
      detalle: 'Juan García: Usuario → Recepción',
      tipo: 'admin'
    },
    {
      id: 4,
      timestamp: '2026-03-10 14:20',
      usuario: 'Katya Imán',
      accion: 'Reserva cancelada',
      detalle: 'Sala Ejecutiva A — 2026-03-10 14:00-15:00',
      tipo: 'reserva'
    },
    {
      id: 5,
      timestamp: '2026-03-10 11:00',
      usuario: 'Carolina Larrea',
      accion: 'EPP devuelto',
      detalle: '2× Casco, 2× Chaleco ← Diego Paredes',
      tipo: 'epp'
    },
    {
      id: 6,
      timestamp: '2026-03-09 17:30',
      usuario: 'Renzo Núñez',
      accion: 'Política actualizada',
      detalle: 'Duración máx. reserva: 3h → 4h',
      tipo: 'admin'
    },
    {
      id: 7,
      timestamp: '2026-03-09 15:00',
      usuario: 'Katya Imán',
      accion: 'Reserva creada',
      detalle: 'Sala Huascarán — 2026-03-11 09:00-10:30',
      tipo: 'reserva'
    },
    {
      id: 8,
      timestamp: '2026-03-09 10:15',
      usuario: 'Juan García',
      accion: 'Reserva creada',
      detalle: 'Sala de Juntas B — 2026-03-09 11:00-12:00',
      tipo: 'reserva'
    },
    {
      id: 9,
      timestamp: '2026-03-08 14:00',
      usuario: 'Carolina Larrea',
      accion: 'EPP entregado',
      detalle: '1× Casco, 1× Zapatos → Carlos Ruiz',
      tipo: 'epp'
    },
    {
      id: 10,
      timestamp: '2026-03-08 09:30',
      usuario: 'Katya Imán',
      accion: 'Reserva editada',
      detalle: 'Sala Almacén Sur — Horario cambiado a 15:00-17:00',
      tipo: 'reserva'
    },
    {
      id: 11,
      timestamp: '2026-03-07 16:00',
      usuario: 'Renzo Núñez',
      accion: 'EPP agregado al catálogo',
      detalle: 'Stock +20 Chalecos reflectivos',
      tipo: 'admin'
    },
    {
      id: 12,
      timestamp: '2026-03-07 11:00',
      usuario: 'Katya Imán',
      accion: 'Reserva creada',
      detalle: 'Phone Booth 1 — 2026-03-07 11:30-12:00',
      tipo: 'reserva'
    }
  ];

  getUser() {
    try {
      const user = sessionStorage.getItem('sc_user');

      if (user) {
        return JSON.parse(user);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  setUser(user: any) {
    sessionStorage.setItem('sc_user', JSON.stringify(user));
  }

  getViewMode() {
    return sessionStorage.getItem('sc_viewMode') || 'admin';
  }

  setViewMode(viewMode: string) {
    sessionStorage.setItem('sc_viewMode', viewMode);
  }

  getUsuarios() {
    try {
      const usuarios = sessionStorage.getItem('sc_usuarios');

      if (usuarios) {
        return JSON.parse(usuarios);
      }

      return this.usuariosInit;
    } catch (e) {
      return this.usuariosInit;
    }
  }

  setUsuarios(usuarios: any[]) {
    sessionStorage.setItem('sc_usuarios', JSON.stringify(usuarios));
  }

  getUsuariosAD() {
    return this.usuariosADInit;
  }

  buscarUsuariosAD(texto: string) {
    const valor = texto.trim().toLowerCase();

    if (valor.length < 2) {
      return [];
    }

    return this.usuariosADInit.filter((u: any) =>
      u.nombre.toLowerCase().includes(valor) ||
      u.correo.toLowerCase().includes(valor)
    );
  }

  asignarRolUsuarioAD(usuarioAD: any, rol: string) {
    const usuarios = this.getUsuarios();

    const existe = usuarios.find(
      (u: any) => u.correo.toLowerCase() === usuarioAD.correo.toLowerCase()
    );

    if (existe) {
      existe.rol = rol;
    } else {
      usuarios.push({
        correo: usuarioAD.correo,
        password: 'Welcome1',
        nombre: usuarioAD.nombre,
        rol: rol,
        cargo: usuarioAD.cargo,
        sede: usuarioAD.sede
      });
    }

    this.setUsuarios(usuarios);
  }

  login(correo: string, password: string) {
    const usuarios = this.getUsuarios();

    const user = usuarios.find(
      (u: any) =>
        u.correo.toLowerCase() === correo.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      return null;
    }

    this.setUser(user);
    this.setViewMode('admin');

    return user;
  }

  requireLogin() {
    if (!this.getUser()) {
      return false;
    }

    return true;
  }

  logout() {
    sessionStorage.clear();
  }

  getEppCatalog() {
    try {
      const data = sessionStorage.getItem('sc_epp');

      if (data) {
        return JSON.parse(data);
      }

      return this.eppCatalogInit;
    } catch (e) {
      return this.eppCatalogInit;
    }
  }

  setEppCatalog(eppCatalog: any[]) {
    sessionStorage.setItem('sc_epp', JSON.stringify(eppCatalog));
  }

  getPolicies() {
    try {
      const data = sessionStorage.getItem('sc_policies');

      if (data) {
        return JSON.parse(data);
      }

      return this.policiesDefault;
    } catch (e) {
      return this.policiesDefault;
    }
  }

  setPolicies(policies: any) {
    sessionStorage.setItem('sc_policies', JSON.stringify(policies));
  }

  getAuditLog() {
    return this.auditLogInit;
  }
}
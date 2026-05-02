import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private usuariosInit = [
    {
      correo: 'u202525251@upc.edu.pe',
      password: '123456',
      nombre: 'Bill Flores Castillo',
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
}
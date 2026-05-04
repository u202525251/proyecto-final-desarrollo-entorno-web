import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // Endpoint de API Gateway para validación con DynamoDB
  private apiUrl = 'https://895ci6fkk9.execute-api.us-east-1.amazonaws.com/default/loginSalaconect';

  // Variables de estado interno para la lógica de SalaConnect[cite: 2]
  private viewMode: string = 'default';
  private policies: any[] = [];
  private usuarios: any[] = [];
  private eppCatalog: any[] = [];
  private auditLog: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // --- Lógica de Autenticación Serverless ---

  login(email: string, pass: string): Observable<any> {
    const body = { email: email, password: pass };
    return this.http.post(this.apiUrl, body);
  }

  requireLogin(): boolean {
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // --- Gestión de Auditoría ---

  getAuditLog(): any[] {
    return this.auditLog;
  }

  setAuditLog(log: any[]): void {
    this.auditLog = log;
  }

  // --- Gestión de Usuarios y EPP[cite: 2] ---

  setUsuarios(usuarios: any[]): void {
    this.usuarios = usuarios;
  }

  getUsuarios(): any[] {
    return this.usuarios;
  }

  buscarUsuariosAD(termino: string): any[] {
    if (!termino) return this.usuarios;
    return this.usuarios.filter(u => 
      u.nombre?.toLowerCase().includes(termino.toLowerCase())
    );
  }

  asignarRolUsuarioAD(usuario: any, rol: string): void {
    console.log(`Rol ${rol} asignado a:`, usuario);
  }

  setEppCatalog(catalog: any[]): void {
    this.eppCatalog = catalog;
  }

  getEppCatalog(): any[] {
    return this.eppCatalog;
  }

  // --- Gestión de Políticas (Corrige error admin.ts:79) ---

  /**
   * Guarda las políticas de gestión de salas
   */
  setPolicies(policies: any[]): void {
    this.policies = policies;
  }

  /**
   * Recupera las políticas para el panel de administración
   */
  getPolicies(): any[] {
    return this.policies;
  }

  // --- Control de Interfaz (Sidebar) ---

  getViewMode(): string {
    return this.viewMode;
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
  }
}
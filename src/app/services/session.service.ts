import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // --- Endpoints de AWS (API Gateway) ---
  // Endpoint para validación de credenciales en la tabla bdusuarios
  private loginUrl = 'https://895ci6fkk9.execute-api.us-east-1.amazonaws.com/default/loginSalaconect';
  
  // Endpoint de lectura para cargar configuración inicial (Salas, EPP, Reuniones)
  private readonly GET_DATA_URL = 'https://du7n8szqs8.execute-api.us-east-1.amazonaws.com/default/obtenerDatosIniciales';
  
  // Endpoint de escritura para persistir nuevas reservas en DynamoDB
  private readonly POST_REUNION_URL = 'https://ke0ytyb0p0.execute-api.us-east-1.amazonaws.com/default/crearReunion';

  // --- Estado Interno de la Aplicación ---
  private viewMode: string = 'admin'; 
  private policies: any[] = [];
  private usuarios: any[] = [];
  private eppCatalog: any[] = [];
  private auditLog: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // --- Sincronización con Infraestructura Serverless ---

  /**
   * Recupera datos en tiempo real de AWS y los persiste en la sesión[cite: 6].
   * Esto elimina la dependencia de datos fijos y habilita el dinamismo del sistema[cite: 5].
   */
  cargarConfiguracionInicial(): void {
    this.http.get(this.GET_DATA_URL).subscribe({
      next: (res: any) => {
        // Almacenamiento local para optimizar el rendimiento del Frontend[cite: 6]
        sessionStorage.setItem("sc_salas", JSON.stringify(res.salas));
        sessionStorage.setItem("sc_epp", JSON.stringify(res.epp));
        sessionStorage.setItem("sc_reuniones", JSON.stringify(res.reuniones));
        
        // Actualización de catálogos locales[cite: 6]
        this.setEppCatalog(res.epp);
        console.log("Sincronización con DynamoDB completada.");
      },
      error: (err) => console.error('Fallo en la conexión con AWS:', err)
    });
  }

  /**
   * Envía una nueva reserva (HU-01) a AWS y refresca las listas locales[cite: 1, 6].
   */
  crearReserva(datos: any): Observable<any> {
    return this.http.post(this.POST_REUNION_URL, datos).pipe(
      tap(() => this.cargarConfiguracionInicial())
    );
  }

  // --- Lógica de Autenticación y Seguridad ---

  login(email: string, pass: string): Observable<any> {
    const body = { email: email, password: pass };
    return this.http.post(this.loginUrl, body);
  }

  requireLogin(): boolean {
    const user = this.getUser();
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
    sessionStorage.clear(); // Limpia datos sensibles al cerrar sesión[cite: 6]
    this.router.navigate(['/login']);
  }

  // --- Gestión de Usuarios (Solución a errores en admin.ts) ---

  /**
   * Setea la lista global de usuarios registrados en el sistema[cite: 6].
   */
  setUsuarios(usuarios: any[]): void {
    this.usuarios = usuarios;
  }

  getUsuarios(): any[] {
    return this.usuarios;
  }

  /**
   * Filtra usuarios por nombre o correo para administración (HU-04/09)[cite: 1, 6].
   */
  buscarUsuariosAD(termino: string): any[] {
    if (!termino) return this.usuarios;
    const t = termino.toLowerCase();
    return this.usuarios.filter(u => 
      u.nombre?.toLowerCase().includes(t) || u.correo?.toLowerCase().includes(t)
    );
  }

  /**
   * Simula la asignación de roles y registra la acción en auditoría (HU-09)[cite: 1, 6].
   */
  asignarRolUsuarioAD(usuario: any, rol: string): void {
    console.log(`Asignando rol ${rol} a ${usuario.nombre}`);
    this.auditLog.push({
      evento: 'Cambio de Rol',
      usuario: usuario.correo,
      detalle: `Nuevo rol: ${rol}`,
      fecha: new Date().toISOString()
    });
  }

  // --- Catálogos y Auditoría ---

  setEppCatalog(catalog: any[]): void {
    this.eppCatalog = catalog;
  }

  getEppCatalog(): any[] {
    if (this.eppCatalog.length === 0) {
      const stored = sessionStorage.getItem("sc_epp");
      return stored ? JSON.parse(stored) : [];
    }
    return this.eppCatalog;
  }

  getAuditLog(): any[] { return this.auditLog; }
  setAuditLog(log: any[]): void { this.auditLog = log; }

  // --- Control de Interfaz y Políticas ---

  getViewMode(): string { return this.viewMode; }
  setViewMode(mode: string): void { this.viewMode = mode; }

  getPolicies(): any[] { return this.policies; }
  setPolicies(policies: any[]): void { this.policies = policies; }
}
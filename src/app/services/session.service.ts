import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // API Gateway para login y gestión de usuarios
  private readonly USUARIOS_API_URL = 'https://u410rk5wc9.execute-api.us-east-1.amazonaws.com/';

  // Endpoint de lectura para cargar configuración inicial: salas, EPP y reuniones
  private readonly GET_DATA_URL = 'https://du7n8szqs8.execute-api.us-east-1.amazonaws.com/default/obtenerDatosIniciales';

  // Endpoint de escritura para crear reuniones
  private readonly POST_REUNION_URL = 'https://ke0ytyb0p0.execute-api.us-east-1.amazonaws.com/default/crearReunion';

  private viewMode: string = 'admin';
  private policies: any = {
    maxDuracionHoras: 4,
    maxRepeticionMeses: 3
  };
  private eppCatalog: any[] = [];
  private auditLog: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ============================================================
  // Datos iniciales generales
  // ============================================================

  cargarConfiguracionInicial(): void {
    this.http.get(this.GET_DATA_URL).subscribe({
      next: (res: any) => {
        sessionStorage.setItem('sc_salas', JSON.stringify(res.salas || []));
        sessionStorage.setItem('sc_epp', JSON.stringify(res.epp || []));
        sessionStorage.setItem('sc_reuniones', JSON.stringify(res.reuniones || []));

        this.setEppCatalog(res.epp || []);

        console.log('Sincronización con DynamoDB completada.');
      },
      error: (err) => {
        console.error('Fallo en la conexión con AWS:', err);
      }
    });
  }

  crearReserva(datos: any): Observable<any> {
    return this.http.post(this.POST_REUNION_URL, datos).pipe(
      tap(() => this.cargarConfiguracionInicial())
    );
  }

  // ============================================================
  // Login
  // ============================================================

  login(email: string, pass: string): Observable<any> {
    const body = {
      email: email,
      password: pass
    };

    return this.http.post<any>(`${this.USUARIOS_API_URL}/login`, body);
  }

  requireLogin(): boolean {
    const user = this.getUser();

    if (!user) {
      this.router.navigate(['/']);
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
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  // ============================================================
  // Gestión de usuarios desde DynamoDB
  // ============================================================

  getUsuariosSistema(): Observable<any[]> {
    return this.http.get<any[]>(`${this.USUARIOS_API_URL}/usuarios`);
  }

  buscarUsuariosAD(termino: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.USUARIOS_API_URL}/usuarios?buscar=${encodeURIComponent(termino)}`
    );
  }

  asignarRolUsuarioAD(usuario: any, rol: string): Observable<any> {
    const body = {
      correo: usuario.correo,
      rol: rol
    };

    return this.http.post<any>(`${this.USUARIOS_API_URL}/usuarios`, body);
  }

  actualizarRolUsuario(correo: string, rol: string): Observable<any> {
    const body = {
      rol: rol
    };

    return this.http.put<any>(
      `${this.USUARIOS_API_URL}/usuarios/${encodeURIComponent(correo)}/rol`,
      body
    );
  }

  eliminarAccesoUsuario(correo: string): Observable<any> {
    return this.http.delete<any>(
      `${this.USUARIOS_API_URL}/usuarios/${encodeURIComponent(correo)}`
    );
  }

  // ============================================================
  // EPP
  // ============================================================

  setEppCatalog(catalog: any[]): void {
    this.eppCatalog = catalog;
    sessionStorage.setItem('sc_epp', JSON.stringify(catalog));
  }

  getEppCatalog(): any[] {
    if (this.eppCatalog.length > 0) {
      return this.eppCatalog;
    }

    const stored = sessionStorage.getItem('sc_epp');
    return stored ? JSON.parse(stored) : [];
  }

  // ============================================================
  // Auditoría
  // ============================================================

  getAuditLog(): any[] {
    return this.auditLog;
  }

  setAuditLog(log: any[]): void {
    this.auditLog = log;
  }

  // ============================================================
  // Vista / modo
  // ============================================================

  getViewMode(): string {
    return this.viewMode;
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  // ============================================================
  // Políticas
  // ============================================================

  getPolicies(): any {
    return this.policies;
  }

  setPolicies(policies: any): void {
    this.policies = policies;
  }
}
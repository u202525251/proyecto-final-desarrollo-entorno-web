import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo: string = '';
  password: string = '';
  mensajeError: string = '';

  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {}

  ingresar() {
    const correoProcesado = this.correo.trim();
    const passwordProcesado = this.password.trim();

    if (correoProcesado === '' || passwordProcesado === '') {
      this.mensajeError = 'Completa el correo y la contraseña.';
      return;
    }

    this.sessionService.login(correoProcesado, passwordProcesado).subscribe({
      next: (res: any) => {
        if (res.authenticated) {
          this.mensajeError = '';
          
          // 1. Guardamos el usuario autenticado desde DynamoDB
          localStorage.setItem('user', JSON.stringify(res.user));
          
          // 2. MODIFICACIÓN CRÍTICA: Sincronizar datos de AWS antes de navegar
          // Esto descarga salas, epp y reuniones de tus Lambdas
          this.sessionService.cargarConfiguracionInicial();

          // 3. Navegar al panel principal
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => { 
        console.error('Error en autenticación AWS:', err);
        if (err.status === 401) {
          this.mensajeError = 'Correo o contraseña incorrectos.';
        } else {
          this.mensajeError = 'No se pudo conectar con el servicio de autenticación de AWS.';
        }
      }
    });
  }
}
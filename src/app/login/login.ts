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

          localStorage.setItem('user', JSON.stringify(res.user));

          this.sessionService.cargarConfiguracionInicial();

          this.router.navigate(['/dashboard']);
        } else {
          this.mensajeError = 'Correo o contraseña incorrectos.';
        }
      },
      error: (err: any) => {
        console.error('Error en autenticación AWS:', err);

        if (err.status === 401) {
          this.mensajeError = 'Correo o contraseña incorrectos.';
        } else if (err.status === 403) {
          this.mensajeError = 'El usuario no tiene acceso al sistema.';
        } else {
          this.mensajeError = 'No se pudo conectar con el servicio de autenticación.';
        }
      }
    });
  }
}
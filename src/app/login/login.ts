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
    // Solo quitamos espacios, mantenemos Mayúsculas/Minúsculas originales
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
          // Guardamos los datos reales que vienen de DynamoDB
          localStorage.setItem('user', JSON.stringify(res.user));
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => { 
        console.error('Error capturado:', err);
        if (err.status === 401) {
          this.mensajeError = 'Correo o contraseña incorrectos.';
        } else {
          this.mensajeError = 'Error de conexión con el servidor.';
        }
      }
    });
  }
}
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
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
    const correoLimpio = this.correo.trim().toLowerCase();
    const passwordLimpio = this.password.trim();

    if (correoLimpio === '' || passwordLimpio === '') {
      this.mensajeError = 'Completa el correo y la contraseña.';
      return;
    }

    const user = this.sessionService.login(correoLimpio, passwordLimpio);

    if (!user) {
      this.mensajeError = 'Correo o contraseña incorrectos.';
      return;
    }

    this.mensajeError = '';
    this.router.navigate(['/dashboard']);
  }
}
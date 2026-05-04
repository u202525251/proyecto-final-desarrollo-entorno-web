import { HttpClient } from '@angular/common/http';
// ...
export class AuthService {
  private apiUrl = 'https://urjsfofrg0.execute-api.us-east-1.amazonaws.com/default/loginSalaconect';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }) {
    // Retornamos el observable para que el componente se suscriba
    return this.http.post(this.apiUrl, credentials);
  }
}
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private http = inject(HttpClient);

  @Output() loggedIn = new EventEmitter();

  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
    this.confirmPassword = '';
  }

  login() {
    this.errorMessage = '';
    this.http
      .post(`${environment.apiUrl}/auth/login`, { email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.access_token);
          this.loggedIn.emit();
        },
        error: () => {
          this.errorMessage = 'Credenciales inválidas';
        },
      });
  }

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.http
      .post(`${environment.apiUrl}/auth/register`, { email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.successMessage = 'Cuenta creada. Podés iniciar sesión.';
          this.mode = 'login';
          this.password = '';
          this.confirmPassword = '';
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Error al crear la cuenta';
        },
      });
  }

  submit() {
    this.mode === 'login' ? this.login() : this.register();
  }
}

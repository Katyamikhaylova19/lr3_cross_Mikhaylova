import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7036/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response) {
          localStorage.setItem('access_token', response);
          localStorage.setItem('username', username);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // В реальном приложении здесь нужно декодировать JWT токен
    // и проверять роль. Для демо просто проверяем имя пользователя
    return this.getUsername() === 'admin';
  }
}
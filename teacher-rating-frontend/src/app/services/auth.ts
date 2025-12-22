import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'access_token';
  private roleKey = 'user_role';
  private usernameKey = 'username';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.decodeAndStoreToken(response.token);
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  private setToken(token: string): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem(this.tokenKey, token);
  }
  this.isAuthenticatedSubject.next(true);
}

private removeToken(): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.usernameKey);
  }
  this.isAuthenticatedSubject.next(false);
}

private hasToken(): boolean {
  if (isPlatformBrowser(this.platformId)) {
    return !!localStorage.getItem(this.tokenKey);
  }
  return false;
}

private decodeAndStoreToken(token: string): void {
  if (isPlatformBrowser(this.platformId)) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem(this.roleKey, payload.role);
      localStorage.setItem(this.usernameKey, payload.unique_name || payload.username);
    } catch (e) {
      console.error('Error decoding token', e);
    }
  }
}

getToken(): string | null {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem(this.tokenKey);
  }
  return null;
}
}
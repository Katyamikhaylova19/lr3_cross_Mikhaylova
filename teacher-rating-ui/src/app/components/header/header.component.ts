import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [MatToolbar, MatIcon]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateAuthState();
    
    // Следим за изменениями состояния авторизации
    this.authService.isLoggedIn();
  }

  updateAuthState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.updateAuthState();
    this.router.navigate(['/login']);
  }

  getGreeting(): string {
    if (!this.username) return 'Гость';
    
    if (this.username === 'admin') {
      return 'Администратор';
    } else {
      return `Студент ${this.username}`;
    }
  }
}
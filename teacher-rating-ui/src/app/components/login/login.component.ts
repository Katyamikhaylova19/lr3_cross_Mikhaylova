import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Если уже авторизован, перенаправляем на главную
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/teachers']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: () => {
          this.toastr.success('Вход выполнен успешно');
          
          // Перенаправляем в зависимости от роли
          if (username === 'admin') {
            this.router.navigate(['/admin-teachers']);
          } else {
            this.router.navigate(['/teachers']);
          }
        },
        error: (error) => {
          this.toastr.error('Неверное имя пользователя или пароль');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Помечаем все поля как touched для отображения ошибок
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  // Быстрый вход для демонстрации
  quickLogin(role: 'user' | 'admin'): void {
    if (role === 'user') {
      this.loginForm.patchValue({
        username: 'user',
        password: 'user123'
      });
    } else {
      this.loginForm.patchValue({
        username: 'admin',
        password: 'admin123'
      });
    }
    this.onSubmit();
  }
}
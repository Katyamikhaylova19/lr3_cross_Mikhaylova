import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: Login
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./pages/dashboard/dashboard-module').then(m => m.DashboardModule),
    canActivate: [AuthGuard] 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];
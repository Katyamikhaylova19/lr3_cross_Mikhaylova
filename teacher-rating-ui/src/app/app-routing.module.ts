import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { StudentsComponent } from './components/students/students.component';
import { RatingsComponent } from './components/ratings/ratings.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { TeacherDetailComponent } from './components/teacher-detail/teacher-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/teachers', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Публичные маршруты
  { path: 'teachers', component: TeachersComponent },
  { path: 'teachers/:id', component: TeacherDetailComponent },
  
  // Защищенные маршруты (требуют авторизации)
  { 
    path: 'students', 
    component: StudentsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'ratings', 
    component: RatingsComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Маршрут для админов
  { 
    path: 'admin-teachers', 
    component: TeachersComponent, 
    canActivate: [AdminGuard] 
  },
  
  // Перенаправление несуществующих маршрутов
  { path: '**', redirectTo: '/teachers' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
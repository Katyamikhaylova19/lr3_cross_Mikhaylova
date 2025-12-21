import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Teacher } from 'src/app/models/teacher.model';
import { TeacherService } from 'src/app/services/teacher.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TeacherFormDialogComponent } from '../teacher-form-dialog/teacher-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {
  // Данные для таблицы
  teachers: Teacher[] = [];
  dataSource = new MatTableDataSource<Teacher>();
  displayedColumns: string[] = ['id', 'fullName', 'averageRating', 'actions'];
  
  // Для таблицы
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Состояние компонента
  isLoading = true;
  viewMode: 'table' | 'cards' = 'table';
  searchTerm = '';
  
  // Статистика
  stats = {
    total: 0,
    withRatings: 0,
    averageRating: 0
  };

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Загрузка преподавателей
  loadTeachers(): void {
    this.isLoading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.dataSource.data = teachers;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Ошибка при загрузке преподавателей');
        this.isLoading = false;
      }
    });
  }

  // Расчет статистики
  calculateStats(): void {
    this.stats.total = this.teachers.length;
    
    const teachersWithRatings = this.teachers.filter(t => 
      t.ratings && t.ratings.length > 0
    );
    this.stats.withRatings = teachersWithRatings.length;
    
    if (teachersWithRatings.length > 0) {
      const totalRating = teachersWithRatings.reduce((sum, teacher) => {
        const avg = teacher.ratings?.reduce((s, r) => s + r.score, 0) || 0;
        const count = teacher.ratings?.length || 1;
        return sum + (avg / count);
      }, 0);
      this.stats.averageRating = totalRating / teachersWithRatings.length;
    }
  }

  // Поиск преподавателей
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  // Переключение режима просмотра
  toggleViewMode(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  // Полное имя преподавателя
  getFullName(teacher: Teacher): string {
    return `${teacher.lastName} ${teacher.firstName} ${teacher.middleName || ''}`.trim();
  }

  // Средний рейтинг
  getAverageRating(teacher: Teacher): number {
    if (!teacher.ratings || teacher.ratings.length === 0) return 0;
    const sum = teacher.ratings.reduce((total, rating) => total + rating.score, 0);
    return sum / teacher.ratings.length;
  }

  // Открытие формы для создания
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TeacherFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.teacherService.createTeacher(result).subscribe({
          next: () => {
            this.toastr.success('Преподаватель успешно создан');
            this.loadTeachers();
          },
          error: () => this.toastr.error('Ошибка при создании преподавателя')
        });
      }
    });
  }

  // Открытие формы для редактирования
  openEditDialog(teacher: Teacher): void {
    const dialogRef = this.dialog.open(TeacherFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', teacher }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.teacherService.updateTeacher(teacher.id, result).subscribe({
          next: () => {
            this.toastr.success('Преподаватель успешно обновлен');
            this.loadTeachers();
          },
          error: () => this.toastr.error('Ошибка при обновлении преподавателя')
        });
      }
    });
  }

  // Удаление преподавателя
  deleteTeacher(teacher: Teacher): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить преподавателя ${this.getFullName(teacher)}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.teacherService.deleteTeacher(teacher.id).subscribe({
          next: () => {
            this.toastr.success('Преподаватель успешно удален');
            this.loadTeachers();
          },
          error: () => this.toastr.error('Ошибка при удалении преподавателя')
        });
      }
    });
  }

  // Проверка прав администратора
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
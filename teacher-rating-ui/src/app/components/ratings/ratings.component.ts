import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Rating } from 'src/app/models/rating.model';
import { Teacher } from 'src/app/models/teacher.model';
import { Student } from 'src/app/models/student.model';
import { RatingService } from 'src/app/services/rating.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { StudentService } from 'src/app/services/student.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RatingFormDialogComponent } from '../rating-form-dialog/rating-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {
  // Данные
  ratings: Rating[] = [];
  teachers: Teacher[] = [];
  students: Student[] = [];
  dataSource = new MatTableDataSource<Rating>();
  
  // Колонки таблицы
  displayedColumns: string[] = ['id', 'teacher', 'student', 'score', 'review', 'anonymous', 'date', 'actions'];
  
  // Для таблицы
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Фильтры
  isLoading = true;
  searchTerm = '';
  selectedTeacherId: number | null = null;
  selectedStudentId: number | null = null;
  minScore: number | null = null;
  maxScore: number | null = null;
  showAnonymous: boolean = true;
  showWithReviews: boolean = true;
  
  // Статистика
  stats = {
    total: 0,
    averageScore: 0,
    withReviews: 0,
    anonymousCount: 0
  };

  constructor(
    private ratingService: RatingService,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRatings();
    this.loadTeachers();
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Кастомная сортировка
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'teacher': return item.teacher?.lastName || '';
        case 'student': return item.student?.lastName || '';
        case 'score': return item.score;
        case 'date': return new Date(item.createdDate).getTime();
        default: return (item as any)[property];
      }
    };
  }

  // Загрузка оценок
  loadRatings(): void {
    this.isLoading = true;
    this.ratingService.getAllRatings().subscribe({
      next: (ratings) => {
        this.ratings = ratings;
        this.dataSource.data = ratings;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Ошибка при загрузке оценок');
        this.isLoading = false;
      }
    });
  }

  // Загрузка преподавателей для фильтра
  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке преподавателей');
      }
    });
  }

  // Загрузка студентов для фильтра
  loadStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке студентов');
      }
    });
  }

  // Расчет статистики
  calculateStats(): void {
    this.stats.total = this.ratings.length;
    
    if (this.ratings.length > 0) {
      const totalScore = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
      this.stats.averageScore = totalScore / this.ratings.length;
      
      this.stats.withReviews = this.ratings.filter(r => r.review && r.review.trim().length > 0).length;
      this.stats.anonymousCount = this.ratings.filter(r => r.isAnonymous).length;
    }
  }

  // Применение фильтров
  applyFilters(): void {
    let filteredData = this.ratings;

    // Фильтр по преподавателю
    if (this.selectedTeacherId) {
      filteredData = filteredData.filter(r => r.teacherId === this.selectedTeacherId);
    }

    // Фильтр по студенту
    if (this.selectedStudentId) {
      filteredData = filteredData.filter(r => r.studentId === this.selectedStudentId);
    }

    // Фильтр по оценке
    if (this.minScore !== null) {
      filteredData = filteredData.filter(r => r.score >= this.minScore!);
    }
    if (this.maxScore !== null) {
      filteredData = filteredData.filter(r => r.score <= this.maxScore!);
    }

    // Фильтр анонимности
    if (!this.showAnonymous) {
      filteredData = filteredData.filter(r => !r.isAnonymous);
    }

    // Фильтр отзывов
    if (!this.showWithReviews) {
      filteredData = filteredData.filter(r => !r.review || r.review.trim().length === 0);
    }

    // Поиск по тексту
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(r => 
        (r.review && r.review.toLowerCase().includes(term)) ||
        (r.teacher?.firstName?.toLowerCase().includes(term)) ||
        (r.teacher?.lastName?.toLowerCase().includes(term)) ||
        (r.student?.firstName?.toLowerCase().includes(term)) ||
        (r.student?.lastName?.toLowerCase().includes(term))
      );
    }

    this.dataSource.data = filteredData;
  }

  // Сброс фильтров
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedTeacherId = null;
    this.selectedStudentId = null;
    this.minScore = null;
    this.maxScore = null;
    this.showAnonymous = true;
    this.showWithReviews = true;
    this.applyFilters();
  }

  // Полное имя преподавателя
  getTeacherName(rating: Rating): string {
    if (!rating.teacher) return 'Неизвестно';
    return `${rating.teacher.lastName} ${rating.teacher.firstName}`;
  }

  // Полное имя студента
  getStudentName(rating: Rating): string {
    if (rating.isAnonymous) return 'Аноним';
    if (!rating.student) return 'Неизвестно';
    return `${rating.student.lastName} ${rating.student.firstName}`;
  }

  // Обрезанный отзыв
  getTruncatedReview(review: string | undefined): string {
    if (!review) return '';
    if (review.length <= 50) return review;
    return review.substring(0, 50) + '...';
  }

  // Открытие формы для создания
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RatingFormDialogComponent, {
      width: '600px',
      data: { 
        mode: 'create',
        teachers: this.teachers,
        students: this.students
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ratingService.createRating(result).subscribe({
          next: () => {
            this.toastr.success('Оценка успешно добавлена');
            this.loadRatings();
          },
          error: (error) => {
            this.toastr.error(error.error || 'Ошибка при добавлении оценки');
          }
        });
      }
    });
  }

  // Открытие формы для редактирования
  openEditDialog(rating: Rating): void {
    const dialogRef = this.dialog.open(RatingFormDialogComponent, {
      width: '600px',
      data: { 
        mode: 'edit', 
        rating,
        teachers: this.teachers,
        students: this.students
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ratingService.updateRating(rating.id, result).subscribe({
          next: () => {
            this.toastr.success('Оценка успешно обновлена');
            this.loadRatings();
          },
          error: (error) => {
            this.toastr.error(error.error || 'Ошибка при обновлении оценки');
          }
        });
      }
    });
  }

  // Удаление оценки
  deleteRating(rating: Rating): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить оценку от ${this.getStudentName(rating)} преподавателю ${this.getTeacherName(rating)}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ratingService.deleteRating(rating.id).subscribe({
          next: () => {
            this.toastr.success('Оценка успешно удалена');
            this.loadRatings();
          },
          error: () => this.toastr.error('Ошибка при удалении оценки')
        });
      }
    });
  }

  // Проверка прав
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Загрузка высоких оценок
  loadHighRated(): void {
    this.ratingService.getHighRated().subscribe({
      next: (highRated) => {
        // Можно отобразить в отдельном представлении
        console.log('High rated:', highRated);
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке высоких оценок');
      }
    });
  }

  // Получить цвет в зависимости от оценки
  getScoreColor(score: number): string {
    if (score >= 4) return 'green';
    if (score >= 3) return 'orange';
    return 'red';
  }
}
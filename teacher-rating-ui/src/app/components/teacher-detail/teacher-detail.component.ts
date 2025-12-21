import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Teacher } from '../../models/teacher.model';
import { AuthService } from '../../services/auth.service';
import { RatingService } from '../../services/rating.service';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-teacher-detail',
  templateUrl: './teacher-detail.component.html',
  styleUrls: ['./teacher-detail.component.css']
})
export class TeacherDetailComponent implements OnInit {
  teacher: Teacher | null = null;
  detailedReport: any[] = [];
  isLoading = true;
  activeTab = 'info';

  // Для новой оценки
  newRating = {
    score: 5,
    review: '',
    isAnonymous: false,
    teacherId: 0
  };
  isAddingRating = false;

  constructor(
    private route: ActivatedRoute,
    private teacherService: TeacherService,
    private ratingService: RatingService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTeacher(Number(id));
      this.loadDetailedReport(Number(id));
    }
  }

  loadTeacher(id: number): void {
    this.isLoading = true;
    this.teacherService.getTeacherById(id).subscribe({
      next: (teacher) => {
        this.teacher = teacher;
        this.newRating.teacherId = teacher.id;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке данных преподавателя');
        this.isLoading = false;
      }
    });
  }

  loadDetailedReport(id: number): void {
    this.teacherService.getTeacherDetailedReport(id).subscribe({
      next: (report) => {
        this.detailedReport = report;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке отчета');
      }
    });
  }

  getFullName(): string {
    if (!this.teacher) return '';
    return `${this.teacher.lastName} ${this.teacher.firstName} ${this.teacher.middleName || ''}`.trim();
  }

  getAverageRating(): number {
    if (!this.teacher?.ratings || this.teacher.ratings.length === 0) return 0;
    const sum = this.teacher.ratings.reduce((total, rating) => total + rating.score, 0);
    return sum / this.teacher.ratings.length;
  }

  getStarArray(): number[] {
    const avg = this.getAverageRating();
    return Array(5).fill(0).map((_, i) => i < avg ? 1 : 0);
  }

  getTeachingGroups(): string[] {
    if (!this.teacher?.teacherGroups) return [];
    return this.teacher.teacherGroups.map(tg => tg.group?.groupNumber || '');
  }

  addRating(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning('Для добавления оценки необходимо авторизоваться');
      return;
    }

    this.isAddingRating = true;
    this.ratingService.createRating({
        ...this.newRating,
        studentId: 1, // Временное значение - в реальном приложении брать из токена
        createdDate: new Date()
    }).subscribe({
      next: () => {
        this.toastr.success('Оценка успешно добавлена');
        this.isAddingRating = false;
        this.newRating = {
          score: 5,
          review: '',
          isAnonymous: false,
          teacherId: this.teacher?.id || 0
        };
        // Перезагружаем данные
        if (this.teacher) {
          this.loadTeacher(this.teacher.id);
          this.loadDetailedReport(this.teacher.id);
        }
      },
      error: (error) => {
        this.toastr.error(error.error || 'Ошибка при добавлении оценки');
        this.isAddingRating = false;
      }
    });
  }

  canAddRating(): boolean {
    return this.authService.isLoggedIn() && this.authService.getUsername() !== 'admin';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStatLabel(key: string): string {
  const labels: { [key: string]: string } = {
    'TeacherName': 'Преподаватель',
    'AverageRating': 'Средний рейтинг',
    'TotalRatings': 'Всего оценок',
    'TeachingGroups': 'Группы'
  };
  return labels[key] || key;
}
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  ratingsReport: any[] = [];
  isLoading = true;
  activeTab = 'info';

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(Number(id));
      this.loadRatingsReport(Number(id));
    }
  }

  loadStudent(id: number): void {
    this.isLoading = true;
    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        this.student = student;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке данных студента');
        this.isLoading = false;
      }
    });
  }

  loadRatingsReport(id: number): void {
    this.studentService.getStudentRatingsReport(id).subscribe({
      next: (report) => {
        this.ratingsReport = report;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке отчета по оценкам');
      }
    });
  }

  getFullName(): string {
    if (!this.student) return '';
    return `${this.student.lastName} ${this.student.firstName} ${this.student.middleName || ''}`.trim();
  }

  getAverageRating(): number {
    if (!this.student?.ratings || this.student.ratings.length === 0) return 0;
    const sum = this.student.ratings.reduce((total, rating) => total + rating.score, 0);
    return sum / this.student.ratings.length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Student } from 'src/app/models/student.model';
import { Group } from 'src/app/models/group.model';
import { StudentService } from 'src/app/services/student.service';
import { GroupService } from 'src/app/services/group.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { StudentFormDialogComponent } from '../student-form-dialog/student-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  groups: Group[] = [];
  dataSource = new MatTableDataSource<Student>();
  
  displayedColumns: string[] = ['id', 'fullName', 'group', 'ratingsCount', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading = true;
  viewMode: 'table' | 'cards' = 'table';
  searchTerm = '';
  selectedGroupId: number | null = null;
  
  stats = {
    total: 0,
    withRatings: 0,
    averageRatings: 0
  };

  constructor(
    private studentService: StudentService,
    private groupService: GroupService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadGroups();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.dataSource.data = students;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Ошибка при загрузке студентов');
        this.isLoading = false;
      }
    });
  }

  loadGroups(): void {
    this.groupService.getAllGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке групп');
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.students.length;
    
    const studentsWithRatings = this.students.filter(s => 
      s.ratings && s.ratings.length > 0
    );
    this.stats.withRatings = studentsWithRatings.length;
    
    if (studentsWithRatings.length > 0) {
      const totalRatings = studentsWithRatings.reduce((sum, student) => 
        sum + (student.ratings?.length || 0), 0
      );
      this.stats.averageRatings = totalRatings / studentsWithRatings.length;
    }
  }

  applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  filterByGroup(): void {
    if (this.selectedGroupId === null) {
      this.dataSource.data = this.students;
    } else {
      this.dataSource.data = this.students.filter(
        student => student.groupId === this.selectedGroupId
      );
    }
  }

  toggleViewMode(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  getFullName(student: Student): string {
    return `${student.lastName} ${student.firstName} ${student.middleName || ''}`.trim();
  }

  getGroupNumber(student: Student): string {
    return student.group?.groupNumber || 'Не указана';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(StudentFormDialogComponent, {
      width: '500px',
      data: { 
        mode: 'create',
        groups: this.groups
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentService.createStudent(result).subscribe({
          next: () => {
            this.toastr.success('Студент успешно добавлен');
            this.loadStudents();
          },
          error: () => this.toastr.error('Ошибка при добавлении студента')
        });
      }
    });
  }

  openEditDialog(student: Student): void {
    const dialogRef = this.dialog.open(StudentFormDialogComponent, {
      width: '500px',
      data: { 
        mode: 'edit', 
        student,
        groups: this.groups
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentService.updateStudent(student.id, result).subscribe({
          next: () => {
            this.toastr.success('Студент успешно обновлен');
            this.loadStudents();
          },
          error: () => this.toastr.error('Ошибка при обновлении студента')
        });
      }
    });
  }

  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить студента ${this.getFullName(student)}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentService.deleteStudent(student.id).subscribe({
          next: () => {
            this.toastr.success('Студент успешно удален');
            this.loadStudents();
          },
          error: () => this.toastr.error('Ошибка при удалении студента')
        });
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGroupId = null;
    this.dataSource.filter = '';
    this.dataSource.data = this.students;
  }
}
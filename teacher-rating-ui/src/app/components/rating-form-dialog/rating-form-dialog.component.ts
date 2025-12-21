import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rating } from '../../models/rating.model';
import { Student } from '../../models/student.model';
import { Teacher } from '../../models/teacher.model';

@Component({
  selector: 'app-rating-form-dialog',
  templateUrl: './rating-form-dialog.component.html',
  styleUrls: ['./rating-form-dialog.component.css']
})
export class RatingFormDialogComponent {
  ratingForm: FormGroup;
  isEditMode: boolean;
  teachers: Teacher[];
  students: Student[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RatingFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      mode: 'create' | 'edit', 
      rating?: Rating,
      teachers: Teacher[],
      students: Student[]
    }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.teachers = data.teachers;
    this.students = data.students;
    
    this.ratingForm = this.fb.group({
      teacherId: ['', Validators.required],
      studentId: ['', Validators.required],
      score: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', Validators.maxLength(1000)],
      isAnonymous: [false]
    });

    if (this.isEditMode && data.rating) {
      this.ratingForm.patchValue(data.rating);
    }
  }

  onSubmit(): void {
    if (this.ratingForm.valid) {
      this.dialogRef.close(this.ratingForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get title(): string {
    return this.isEditMode ? 'Редактировать оценку' : 'Добавить оценку';
  }
}
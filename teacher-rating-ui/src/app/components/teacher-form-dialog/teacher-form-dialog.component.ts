import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Teacher } from '../../models/teacher.model';

@Component({
  selector: 'app-teacher-form-dialog',
  templateUrl: './teacher-form-dialog.component.html',
  styleUrls: ['./teacher-form-dialog.component.css']
})
export class TeacherFormDialogComponent {
  teacherForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TeacherFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', teacher?: Teacher }
  ) {
    this.isEditMode = data.mode === 'edit';
    
    this.teacherForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', Validators.maxLength(100)]
    });

    if (this.isEditMode && data.teacher) {
      this.teacherForm.patchValue(data.teacher);
    }
  }

  onSubmit(): void {
    if (this.teacherForm.valid) {
      this.dialogRef.close(this.teacherForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get title(): string {
    return this.isEditMode ? 'Редактировать преподавателя' : 'Добавить преподавателя';
  }
}
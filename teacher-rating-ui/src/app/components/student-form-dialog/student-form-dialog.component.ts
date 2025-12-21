import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Group } from '../../models/group.model';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-form-dialog',
  templateUrl: './student-form-dialog.component.html',
  styleUrls: ['./student-form-dialog.component.css']
})
export class StudentFormDialogComponent {
  studentForm: FormGroup;
  isEditMode: boolean;
  groups: Group[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StudentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      mode: 'create' | 'edit', 
      student?: Student,
      groups?: Group[]
    }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.groups = data.groups || [];
    
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', Validators.maxLength(100)],
      groupId: ['', Validators.required]
    });

    if (this.isEditMode && data.student) {
      this.studentForm.patchValue(data.student);
    }
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.dialogRef.close(this.studentForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get title(): string {
    return this.isEditMode ? 'Редактировать студента' : 'Добавить студента';
  }
}
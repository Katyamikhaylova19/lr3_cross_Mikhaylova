import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'https://localhost:7036/api/students';

  constructor(private http: HttpClient) { }

  // Получить всех студентов
  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  // Получить студента по ID
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  // Создать студента
  createStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  // Обновить студента
  updateStudent(id: number, student: Student): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, student);
  }

  // Удалить студента
  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Получить студентов по группе
  getStudentsByGroup(groupId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/by-group/${groupId}`);
  }

  // Получить студентов с оценками
  getStudentsWithRatings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/with-ratings`);
  }

  // Получить отчет по оценкам студента
  getStudentRatingsReport(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${studentId}/ratings-report`);
  }

  // Проверить, может ли студент оценить преподавателя
  canStudentRateTeacher(studentId: number, teacherId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${studentId}/can-rate-teacher/${teacherId}`);
  }
}
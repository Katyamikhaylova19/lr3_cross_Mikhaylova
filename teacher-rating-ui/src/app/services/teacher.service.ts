import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher, TeacherGroup } from '../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = 'https://localhost:7036/api/teachers';

  constructor(private http: HttpClient) { }

  // Получить всех преподавателей
  getAllTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  // Получить преподавателя по ID
  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  // Создать преподавателя
  createTeacher(teacher: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, teacher);
  }

  // Обновить преподавателя
  updateTeacher(id: number, teacher: Teacher): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, teacher);
  }

  // Удалить преподавателя
  deleteTeacher(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Поиск преподавателей
  searchTeachers(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?name=${name}`);
  }

  // Топ рейтинговых преподавателей
  getTopRatedTeachers(count: number = 5): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.apiUrl}/top-rated?count=${count}`);
  }

  // Преподаватели без оценок
  getTeachersWithNoRatings(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.apiUrl}/no-ratings`);
  }

  // Статистика по группе
  getGroupStatistics(groupNumber: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/group-statistics/${groupNumber}`);
  }

  // Детальный отчет по преподавателю
  getTeacherDetailedReport(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/detailed-report`);
  }

  // Добавить преподавателя в группу
  addTeacherToGroup(teacherId: number, groupId: number): Observable<TeacherGroup> {
    return this.http.post<TeacherGroup>(`${this.apiUrl}/${teacherId}/groups/${groupId}`, {});
  }

  // Удалить преподавателя из группы
  removeTeacherFromGroup(teacherId: number, groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teacherId}/groups/${groupId}`);
  }

  // Получить преподавателей по группе
  getTeachersByGroup(groupNumber: string): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.apiUrl}/by-group/${groupNumber}`);
  }
}
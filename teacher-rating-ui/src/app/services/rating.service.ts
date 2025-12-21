import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'https://localhost:7036/api/ratings';

  constructor(private http: HttpClient) { }

  // Получить все оценки
  getAllRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(this.apiUrl);
  }

  // Получить оценку по ID
  getRatingById(id: number): Observable<Rating> {
    return this.http.get<Rating>(`${this.apiUrl}/${id}`);
  }

  // Создать оценку
  createRating(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, rating);
  }

  // Обновить оценку
  updateRating(id: number, rating: Rating): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, rating);
  }

  // Удалить оценку
  deleteRating(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Получить оценки преподавателя
  getRatingsByTeacher(teacherId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  // Получить оценки студента
  getRatingsByStudent(studentId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/student/${studentId}`);
  }

  // Получить мои оценки
  getMyRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/my-ratings`);
  }

  // Получить высокие оценки
  getHighRated(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/high-rated`);
  }

  // Проверить, может ли студент оценить преподавателя
  canStudentRateTeacher(studentId: number, teacherId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/can-rate/${studentId}/${teacherId}`);
  }
}
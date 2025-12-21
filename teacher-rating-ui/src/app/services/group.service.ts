import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'https://localhost:7036/api/groups';

  constructor(private http: HttpClient) { }

  // Получить все группы
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  // Получить группу по ID
  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  // Создать группу
  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, group);
  }

  // Обновить группу
  updateGroup(id: number, group: Group): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, group);
  }

  // Удалить группу
  deleteGroup(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Получить группу по номеру
  getGroupByNumber(groupNumber: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/by-number/${groupNumber}`);
  }
}
import api from './auth';
import { Teacher } from '../types';

export const teacherApi = {
  getAllTeachers: async (): Promise<Teacher[]> => {
    const response = await api.get('/teachers');
    return response.data;
  },

  getTeacherById: async (id: number): Promise<Teacher> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  getTopRated: async (count: number = 5): Promise<Teacher[]> => {
    const response = await api.get(`/teachers/top-rated?count=${count}`);
    return response.data;
  },

  searchTeachers: async (name: string): Promise<any> => {
    const response = await api.get(`/teachers/search?name=${name}`);
    return response.data;
  },

  createTeacher: async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
    const response = await api.post('/teachers', teacher);
    return response.data;
  },

  updateTeacher: async (id: number, teacher: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.put(`/teachers/${id}`, teacher);
    return response.data;
  },

  deleteTeacher: async (id: number): Promise<void> => {
    await api.delete(`/teachers/${id}`);
  },

  addTeacherToGroup: async (teacherId: number, groupId: number): Promise<any> => {
    const response = await api.post(`/teachers/${teacherId}/groups/${groupId}`);
    return response.data;
  },

  removeTeacherFromGroup: async (teacherId: number, groupId: number): Promise<void> => {
    await api.delete(`/teachers/${teacherId}/groups/${groupId}`);
  },

  getTeachersByGroup: async (groupId: number): Promise<Teacher[]> => {
    const response = await api.get(`/teachers/by-group/${groupId}`);
    return response.data;
  },

  getAvailableTeachersForStudent: async (studentId: number): Promise<Teacher[]> => {
    // Получаем студента и его группу, затем преподавателей этой группы
    const response = await api.get(`/students/${studentId}`);
    const student = response.data;
    
    if (!student.groupId) {
      return [];
    }

    return teacherApi.getTeachersByGroup(student.groupId);
  },

  getTeachersWithoutRatings: async (): Promise<Teacher[]> => {
    try {
      const response = await api.get('/teachers/no-ratings');
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers without ratings:', error);
      return [];
    }
  },

  getGroupStatistics: async (groupNumber: string): Promise<any> => {
    try {
      const response = await api.get(`/teachers/group-statistics/${groupNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group statistics:', error);
      return null;
    }
  },
};
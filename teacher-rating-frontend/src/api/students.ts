import api from './auth';
import { Student } from '../types';

export const studentApi = {
  // CRUD операции
  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get('/students');
    return response.data;
  },

  getStudentById: async (id: number): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const response = await api.post('/students', student);
    return response.data;
  },

  updateStudent: async (id: number, student: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, student);
    return response.data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  // Специфичные операции
  getStudentsByGroup: async (groupId: number): Promise<Student[]> => {
    const response = await api.get(`/students/by-group/${groupId}`);
    return response.data;
  },

  getStudentRatingsReport: async (studentId: number): Promise<any> => {
    const response = await api.get(`/students/${studentId}/ratings-report`);
    return response.data;
  },

  getStudentsWithRatings: async (): Promise<any[]> => {
    const response = await api.get('/students/with-ratings');
    return response.data;
  },

  canStudentRateTeacher: async (studentId: number, teacherId: number): Promise<boolean> => {
    try {
      // Этот метод реализуем отдельно, так как в API нет прямого endpoint
      const student = await studentApi.getStudentById(studentId);
      const teacherGroups = student.group?.teacherGroups || [];
      
      return teacherGroups.some(tg => tg.teacherId === teacherId);
    } catch (error) {
      console.error('Error checking if student can rate teacher:', error);
      return false;
    }
  },

  getStudentsWithMostRatings: async (limit: number = 10): Promise<Student[]> => {
    try {
      const students = await studentApi.getAllStudents();
      return students
        .filter(s => s.ratings && s.ratings.length > 0)
        .sort((a, b) => (b.ratings?.length || 0) - (a.ratings?.length || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching students with most ratings:', error);
      return [];
    }
  },
};
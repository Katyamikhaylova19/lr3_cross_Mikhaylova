import api from './auth';
import { Group } from '../types';
import { studentApi } from './students';

export const groupApi = {
  /*getAllGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups'); // Предполагаем, что есть endpoint для групп
    return response.data;
  },

  getGroupById: async (id: number): Promise<Group> => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },*/

  createGroup: async (group: Omit<Group, 'id'>): Promise<Group> => {
    const response = await api.post('/groups', group);
    return response.data;
  },

  updateGroup: async (id: number, group: Partial<Group>): Promise<Group> => {
    const response = await api.put(`/groups/${id}`, group);
    return response.data;
  },

  deleteGroup: async (id: number): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },

  getAllGroups: async (): Promise<Group[]> => {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  },

  getGroupById: async (id: number): Promise<Group | null> => {
    try {
      return null;
    } catch (error) {
      console.error('Error fetching group:', error);
      return null;
    }
  },

  getGroupsFromStudents: async (): Promise<Group[]> => {
    try {
      const students = await studentApi.getAllStudents();
      const groups: Group[] = [];
      const seen = new Set<number>();
      
      students.forEach(student => {
        if (student.group && !seen.has(student.group.id)) {
          seen.add(student.group.id);
          groups.push(student.group);
        }
      });
      
      return groups;
    } catch (error) {
      console.error('Error extracting groups from students:', error);
      return [];
    }
  },
};
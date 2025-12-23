export interface User {
  username: string;
  role: 'Admin' | 'User';
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  averageRating?: number;
  ratings?: Rating[];
  teacherGroups?: TeacherGroup[];
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  groupId: number;
  group?: Group;
  ratings?: Rating[];
}

export interface Group {
  id: number;
  groupNumber: string;
  students?: Student[];
  teacherGroups?: TeacherGroup[];
}

export interface Rating {
  id: number;
  score: number;
  review?: string;
  isAnonymous: boolean;
  createdDate: string;
  studentId: number;
  teacherId: number;
  student?: Student;
  teacher?: Teacher;
}

export interface TeacherGroup {
  id: number;
  teacherId: number;
  groupId: number;
  teacher?: Teacher;
  group?: Group;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  groupId: number;
}

export interface Rating {
  id: number;
  score: number;
  review?: string;
  isAnonymous: boolean;
  createdDate: Date;
  studentId: number;
  teacherId: number;
}

export interface Group {
  id: number;
  groupNumber: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}
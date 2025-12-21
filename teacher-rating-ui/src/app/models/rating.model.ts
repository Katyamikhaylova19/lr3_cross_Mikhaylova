export interface Rating {
  id: number;
  score: number;
  review?: string;
  isAnonymous: boolean;
  createdDate: Date;
  studentId: number;
  teacherId: number;
  student?: Student;
  teacher?: Teacher;
}
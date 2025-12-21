export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  teacherGroups?: TeacherGroup[];
  ratings?: Rating[];
}

export interface TeacherGroup {
  id: number;
  teacherId: number;
  groupId: number;
  teacher?: Teacher;
  group?: Group;
}
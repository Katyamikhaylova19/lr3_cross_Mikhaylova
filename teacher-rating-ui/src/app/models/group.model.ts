export interface Group {
  id: number;
  groupNumber: string;
  students?: Student[];
  teacherGroups?: TeacherGroup[];
}
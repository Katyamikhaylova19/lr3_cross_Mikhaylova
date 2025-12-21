import { Student } from "./student.model";
import { TeacherGroup } from "./teacher.model";

export interface Group {
  id: number;
  groupNumber: string;
  students?: Student[];
  teacherGroups?: TeacherGroup[];
}
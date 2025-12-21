export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  groupId: number;
  group?: Group;
  ratings?: Rating[];
}
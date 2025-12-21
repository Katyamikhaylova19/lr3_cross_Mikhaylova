import { Group } from "./group.model";
import { Rating } from "./rating.model";

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  groupId: number;
  group?: Group;
  ratings?: Rating[];
}
import {User} from "./user";

export interface Member {
  projectId: string;
  userId: string;

  _user?: User;
}

import {User} from "./user";

export interface Member {
  userId: string;
  role?: string;

  _user?: User;
}

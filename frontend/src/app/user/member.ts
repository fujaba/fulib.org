import {User} from "./user";

export interface Member {
  parent: string;
  user: string;
  role?: string;

  _user?: User;
}

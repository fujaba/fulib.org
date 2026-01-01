import {User} from "./user";

export interface Member {
  parent: string;
  user: string;
  role?: string;

  _user?: User;
}

export function setUsers(members: Member[], users: User[]) {
  for (const user of users) {
    const member = members.find(m => m.user === user.id);
    if (member) {
      member._user = user;
    }
  }
}

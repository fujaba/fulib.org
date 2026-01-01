import {User} from "./user";

export interface Member {
  parent: string;
  user: string;
  role?: string;

  _user?: User;
}

export function setUsers(members: Member[], users: User[]) {
  // assume for every user there is a member,
  // but not necessarily vice-versa,
  // i.e. users.length < members.length
  const memberMap = new Map(members.map(m => [m.user, m]));
  for (const user of users) {
    const member = memberMap.get(user.id!);
    if (member) {
      member._user = user;
    }
  }
}

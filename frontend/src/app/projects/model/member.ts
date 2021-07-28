import {User} from '../../user/user';

export interface Member {
  projectId: string;
  userId: string;

  user?: User;
}

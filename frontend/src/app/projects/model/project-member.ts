import {Member} from "../../user/member";

export interface ProjectMember extends Member {
  projectId: string;
}

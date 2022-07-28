export type Project = UserProject | LocalProject;

export interface ProjectStub {
  name: string;
  description: string;
  dockerImage?: string;
  local?: boolean;
}

export interface BaseProject extends ProjectStub {
  id: string;
  created: Date;
}

export interface UserProject extends BaseProject {
  userId: string;
  local?: false;
}

export interface LocalProject extends BaseProject {
  local: true;
}

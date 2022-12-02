export interface Project {
  id: string;
  userId: string;
  created: string;
  name: string;
  icon?: string;
  description: string;
  dockerImage?: string;
  repository?: string;
}

export type CreateProjectDto = Omit<Project, 'id' | 'userId' | 'created'>;

export interface Project {
  id: string;
  userId: string;
  created: string;
  name: string;
  description: string;
  dockerImage?: string;
}

export type CreateProjectDto = Omit<Project, 'id' | 'userId' | 'created'>;

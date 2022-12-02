import {Project} from './project';

export class Container {
  id: string;
  url: string;
  projectId: string;
  token: string;
  vncUrl: string;
  isNew: boolean;
}

export interface CreateContainerDto extends Pick<Project, 'dockerImage' | 'repository'> {
  projectId?: string;
  machineSettings?: object;
}

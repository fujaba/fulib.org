export class ProjectStub {
  name: string;
  description: string;
}

export class Project extends ProjectStub {
  id: string;
  user: string;
  created: Date;
}

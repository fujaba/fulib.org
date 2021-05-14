import {Injectable} from '@angular/core';
import ObjectID from 'bson-objectid';
import {StorageService} from '../storage.service';
import {ProjectStub, LocalProject} from './model/project';

@Injectable({providedIn: 'root'})
export class LocalProjectService {
  constructor(
    private storageService: StorageService,
  ) {
  }

  private getKey(id: string) {
    return `projects/${id}`;
  }

  create(stub: ProjectStub): LocalProject {
    const project: LocalProject = {
      ...stub,
      local: true,
      created: new Date(),
      id: new ObjectID().toHexString(),
    };
    this.update(project);
    return project;
  }

  get(id: string): LocalProject | undefined {
    const stored = this.storageService.get(this.getKey(id));
    return stored ? JSON.parse(stored) : undefined;
  }

  getAll(): LocalProject[] {
    return this.storageService.getAllKeys(/^projects\/(\w+)$/)
      .map(key => this.get(key))
      .filter((t): t is LocalProject => !!t);
  }

  update(project: LocalProject): void {
    this.storageService.set(this.getKey(project.id), JSON.stringify(project));
  }

  delete(id: string): void {
    this.storageService.set(this.getKey(id), null);
  }
}

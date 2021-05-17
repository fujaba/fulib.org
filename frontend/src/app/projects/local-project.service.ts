import {Injectable} from '@angular/core';
import ObjectID from 'bson-objectid';
import {ProjectConfig} from '../model/project-config';
import {StorageService} from '../storage.service';
import {LocalProject, ProjectStub} from './model/project';

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
    return this.storageService.getAllKeys(/^projects\/\w+$/)
      .map(([key]) => JSON.parse(this.storageService.get(key)!));
  }

  update(project: LocalProject): void {
    this.storageService.set(this.getKey(project.id), JSON.stringify(project));
  }

  delete(id: string): void {
    for (const [key] of this.storageService.getAllKeys(new RegExp(`^projects/${id}(?:$|/.*)`))) {
      this.storageService.set(key, null);
    }
  }

  getConfig(id: string): ProjectConfig | undefined {
    const storage = this.storageService.get(this.getKey(id) + '/config');
    return storage ? JSON.parse(storage) : undefined;
  }

  saveConfig(id: string, config: ProjectConfig) {
    this.storageService.set(this.getKey(id) + '/config', JSON.stringify(config));
  }
}

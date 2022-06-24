import {Injectable} from '@angular/core';
import ObjectID from 'bson-objectid';
import {ProjectConfig} from '../../shared/model/project-config';
import {StorageService} from '../../storage.service';
import {LocalProject, ProjectStub} from '../model/project';

@Injectable()
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

  /**
   * Deletes the local project metadata from local storage, but renames all other keys to use the new ID.
   * @param source the source ID
   * @param target the target ID
   */
  deleteAndChangeId(source: string, target: string): void {
    this.storageService.set(`projects/${source}`, null);
    for (const [oldKey] of this.storageService.getAllKeys(new RegExp(`^projects/${source}/.*$`))) {
      const oldValue = this.storageService.get(oldKey)!;
      // NB: This is ok because both source and target are ObjectIDs,
      //     which should not occur in normal text.
      //     It is actually beneficial because
      //     a) Replacing in the value ensures open files are still open in the new project.
      //     b) Replacing in the key ensures files are actually copied
      //        (the key contains the absolute path, including the project ID).
      const sourcePattern = new RegExp(source, 'g');
      const newValue = oldValue.replace(sourcePattern, target);
      const newKey = oldKey.replace(sourcePattern, target);
      this.storageService.set(newKey, newValue);
      this.storageService.set(oldKey, null);
    }
  }

  getConfig(id: string): ProjectConfig | undefined {
    const storage = this.storageService.get(this.getKey(id) + '/config');
    return storage ? JSON.parse(storage) : undefined;
  }

  saveConfig(id: string, config: ProjectConfig) {
    this.storageService.set(this.getKey(id) + '/config', JSON.stringify(config));
  }

  deleteConfig(id: string) {
    this.storageService.set(this.getKey(id) + '/config', null);
  }

  private getFileKey(id: string, path: string) {
    return this.getKey(id) + '/files/' + path;
  }

  getFiles(id: string): string[] {
    const pattern = new RegExp(`^${this.getFileKey(id, '')}(.*)`);
    return this.storageService.getAllKeys(pattern).map(([, path]) => path);
  }

  getFile(id: string, path: string): string | null {
    return this.storageService.get(this.getFileKey(id, path));
  }

  saveFile(id: string, path: string, content: string): void {
    this.storageService.set(this.getFileKey(id, path), content);
  }

  deleteFile(id: string, path: string): void {
    this.storageService.set(this.getFileKey(id, path), null);
  }
}

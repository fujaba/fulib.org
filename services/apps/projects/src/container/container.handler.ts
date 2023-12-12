import {Project} from "../project/project.schema";
import {OnEvent} from "@nestjs/event-emitter";
import {Injectable} from "@nestjs/common";
import {ContainerService} from "./container.service";


@Injectable()
export class ContainerHandler {
  constructor(
    private containerService: ContainerService,
  ) {
  }

  @OnEvent('projects.*.deleted')
  onProjectDeleted(project: Project) {
    this.containerService.deleteStorage(project._id.toString());
  }
}

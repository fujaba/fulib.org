import {Injectable} from "@angular/core";
import {StorageService} from "../../services/storage.service";

@Injectable()
export class TokenService {
  constructor(
    private storage: StorageService,
  ) {
  }

  getAssignmentToken(assignment: string): string | null {
    return this.storage.get(`assignmentToken/${assignment}`);
  }

  getSolutionToken(assignment: string, solution: string): string | null {
    return this.storage.get(`solutionToken/${assignment}/${solution}`);
  }
}

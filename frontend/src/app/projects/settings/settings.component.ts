import {Component, OnInit, TemplateRef} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Project} from '../model/project';
import {ProjectManager} from '../project.manager';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  project: Project;

  deleting = false;

  private deletingModal?: NgbModalRef;

  constructor(
    private projectManager: ProjectManager,
    private projectService: ProjectService,
    private router: Router,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.project = this.projectManager.project;
  }

  save(): void {
    this.projectService.update(this.project).subscribe(result => Object.assign(this.project, result));
  }

  openModal(modal: TemplateRef<any>, label: string) {
    this.deletingModal = this.modalService.open(modal, {
      ariaLabelledBy: label,
      beforeDismiss: async () => !this.deleting,
    });
  }

  delete(): void {
    this.deleting = true;
    this.projectService.delete(this.project.id!).subscribe(() => {
      this.deleting = false;
      this.router.navigate(['/projects']);
      this.deletingModal?.close();
    });
  }
}

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {FileChangeService} from '../../file-change.service';
import {FileEditor} from '../../model/file-editor';
import {ProjectManager} from '../../project.manager';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss'],
})
export class FileEditorComponent implements OnInit, OnDestroy {
  @Input() editor: FileEditor;
  @Output() dismiss = new EventEmitter<void>();

  subscription: Subscription;

  constructor(
    private projectManager: ProjectManager,
    private fileChangeService: FileChangeService,
  ) {
  }

  ngOnInit(): void {
    const file = this.editor.file;
    this.subscription = this.fileChangeService.watch(this.projectManager, file).subscribe(event => {
      if (event.event === 'deleted') {
        this.dismiss.emit();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

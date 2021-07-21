import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {FileCodeEditorComponent} from './file-code-editor/file-code-editor.component';
import {FileEditorComponent} from './file-editor/file-editor.component';
import {FileIframeViewerComponent} from './file-iframe-viewer/file-iframe-viewer.component';
import {FileImageViewerComponent} from './file-image-viewer/file-image-viewer.component';
import {FileMarkdownViewerComponent} from './file-markdown-viewer/file-markdown-viewer.component';
import {IframeViewerComponent} from './iframe-viewer/iframe-viewer.component';
import { FileDownloadViewerComponent } from './file-download-viewer/file-download-viewer.component';

@NgModule({
  declarations: [
    FileEditorComponent,
    FileCodeEditorComponent,
    FileImageViewerComponent,
    FileIframeViewerComponent,
    FileMarkdownViewerComponent,
    IframeViewerComponent,
    FileDownloadViewerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
  ],
  exports: [
    FileEditorComponent,
  ],
})
export class EditorModule {
}

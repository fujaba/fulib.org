import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDownloadViewerComponent } from './file-download-viewer.component';

describe('FileDownloadViewerComponent', () => {
  let component: FileDownloadViewerComponent;
  let fixture: ComponentFixture<FileDownloadViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileDownloadViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDownloadViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

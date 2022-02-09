import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockupViewerComponent } from './mockup-viewer.component';

describe('MockupViewerComponent', () => {
  let component: MockupViewerComponent;
  let fixture: ComponentFixture<MockupViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MockupViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockupViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

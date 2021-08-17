import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunAnythingComponent } from './run-anything.component';

describe('RunAnythingComponent', () => {
  let component: RunAnythingComponent;
  let fixture: ComponentFixture<RunAnythingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunAnythingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunAnythingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

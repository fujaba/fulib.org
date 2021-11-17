import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentTasksComponent } from './tasks.component';

describe('TasksComponent', () => {
  let component: AssignmentTasksComponent;
  let fixture: ComponentFixture<AssignmentTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionTasksComponent } from './tasks.component';

describe('TasksComponent', () => {
  let component: SolutionTasksComponent;
  let fixture: ComponentFixture<SolutionTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolutionTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

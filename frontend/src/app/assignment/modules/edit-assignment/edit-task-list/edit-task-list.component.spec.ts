import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaskListComponent } from './edit-task-list.component';

describe('EditTaskListComponent', () => {
  let component: EditTaskListComponent;
  let fixture: ComponentFixture<EditTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTaskListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentActionsComponent } from './assignment-actions.component';

describe('AssignmentActionsComponent', () => {
  let component: AssignmentActionsComponent;
  let fixture: ComponentFixture<AssignmentActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

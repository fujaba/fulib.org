import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigneeInputComponent } from './assignee-input.component';

describe('AssigneeInputComponent', () => {
  let component: AssigneeInputComponent;
  let fixture: ComponentFixture<AssigneeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssigneeInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigneeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

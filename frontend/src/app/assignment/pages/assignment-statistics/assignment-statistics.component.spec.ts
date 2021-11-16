import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentStatisticsComponent } from './assignment-statistics.component';

describe('AssignmentStatisticsComponent', () => {
  let component: AssignmentStatisticsComponent;
  let fixture: ComponentFixture<AssignmentStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentStatisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetrackingComponent } from './timetracking.component';

describe('TimetrackingComponent', () => {
  let component: TimetrackingComponent;
  let fixture: ComponentFixture<TimetrackingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimetrackingComponent]
    });
    fixture = TestBed.createComponent(TimetrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

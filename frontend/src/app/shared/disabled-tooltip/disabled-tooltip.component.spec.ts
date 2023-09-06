import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledTooltipComponent } from './disabled-tooltip.component';

describe('DisabledTooltipComponent', () => {
  let component: DisabledTooltipComponent;
  let fixture: ComponentFixture<DisabledTooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisabledTooltipComponent]
    });
    fixture = TestBed.createComponent(DisabledTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProTipComponent } from './pro-tip.component';

describe('ProTipComponent', () => {
  let component: ProTipComponent;
  let fixture: ComponentFixture<ProTipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProTipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

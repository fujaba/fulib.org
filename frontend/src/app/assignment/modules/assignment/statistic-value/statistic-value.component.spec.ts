import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticValueComponent } from './statistic-value.component';

describe('StatisticValueComponent', () => {
  let component: StatisticValueComponent;
  let fixture: ComponentFixture<StatisticValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

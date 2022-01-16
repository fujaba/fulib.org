import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsBlockComponent } from './statistics-block.component';

describe('StatisticsBlockComponent', () => {
  let component: StatisticsBlockComponent;
  let fixture: ComponentFixture<StatisticsBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticsBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteTabsComponent } from './route-tabs.component';

describe('RouteTabsComponent', () => {
  let component: RouteTabsComponent;
  let fixture: ComponentFixture<RouteTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

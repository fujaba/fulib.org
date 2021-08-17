import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEverywhereComponent } from './search-everywhere.component';

describe('SearchEverywhereComponent', () => {
  let component: SearchEverywhereComponent;
  let fixture: ComponentFixture<SearchEverywhereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchEverywhereComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchEverywhereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

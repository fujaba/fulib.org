import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTypeaheadComponent } from './user-typeahead.component';

describe('UserTypeaheadComponent', () => {
  let component: UserTypeaheadComponent;
  let fixture: ComponentFixture<UserTypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTypeaheadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

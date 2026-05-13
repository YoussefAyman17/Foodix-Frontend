import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMeals } from './manage-meals';

describe('ManageMeals', () => {
  let component: ManageMeals;
  let fixture: ComponentFixture<ManageMeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMeals],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageMeals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

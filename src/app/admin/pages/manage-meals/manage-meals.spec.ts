import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';

import { ManageMeals } from './manage-meals';

describe('ManageMeals', () => {
  let component: ManageMeals;
  let fixture: ComponentFixture<ManageMeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMeals],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideToastr()],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageMeals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

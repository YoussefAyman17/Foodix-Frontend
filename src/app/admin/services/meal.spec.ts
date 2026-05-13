import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { MealService } from './meal';

describe('MealService', () => {
  let service: MealService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(MealService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

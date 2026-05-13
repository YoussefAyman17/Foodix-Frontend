import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';

import { ManageOrders } from './manage-orders';

describe('ManageOrders', () => {
  let component: ManageOrders;
  let fixture: ComponentFixture<ManageOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageOrders],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideToastr()],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

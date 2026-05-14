import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryHome } from './delivery-home';

describe('DeliveryHome', () => {
  let component: DeliveryHome;
  let fixture: ComponentFixture<DeliveryHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryHome],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

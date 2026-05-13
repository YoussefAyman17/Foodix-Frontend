import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOrdersPage } from './my-orders-page';

describe('MyOrdersPage', () => {
  let component: MyOrdersPage;
  let fixture: ComponentFixture<MyOrdersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOrdersPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MyOrdersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

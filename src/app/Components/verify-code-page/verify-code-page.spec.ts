import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyCodePage } from './verify-code-page';

describe('VerifyCodePage', () => {
  let component: VerifyCodePage;
  let fixture: ComponentFixture<VerifyCodePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyCodePage],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyCodePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

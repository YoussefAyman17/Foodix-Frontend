import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VerifyCodePage } from './verify-code-page';

describe('VerifyCodePage', () => {
  let component: VerifyCodePage;
  let fixture: ComponentFixture<VerifyCodePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyCodePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyCodePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

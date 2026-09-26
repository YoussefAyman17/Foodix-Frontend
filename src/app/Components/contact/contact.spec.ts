import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Complaints } from './contact';

describe('Contact', () => {
  let component: Complaints;
  let fixture: ComponentFixture<Complaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Complaints],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Complaints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

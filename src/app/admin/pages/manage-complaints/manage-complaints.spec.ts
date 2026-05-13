import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageComplaints } from './manage-complaints';

describe('ManageComplaints', () => {
  let component: ManageComplaints;
  let fixture: ComponentFixture<ManageComplaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageComplaints],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageComplaints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

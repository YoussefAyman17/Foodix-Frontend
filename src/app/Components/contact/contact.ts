import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComplaintsService } from '../../core/services/complaints';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Complaints implements OnInit {
  private fb = inject(FormBuilder);
  private complaintService = inject(ComplaintsService);
  private authService = inject(Auth);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  complaintForm!: FormGroup;
  isLoggedIn: boolean = false;
  isSubmitting: boolean = false;
  // userComplaints: any[] = [];
  isLoadingHistory: boolean = false;

  services: string[] = ['Delivery', 'Food Quality', 'Payment Issue', 'App Bug', 'Other'];

  ngOnInit(): void {
    this.isLoggedIn = this.authService.decodedUserData() ? true : false;
    this.initForm();

    // if (this.isLoggedIn) {
    //   this.fetchUserComplaints();
    // }
  }

  private initForm(): void {
    const currentUser = this.authService.decodedUserData();

    this.complaintForm = this.fb.group({
      service: ['', Validators.required],
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      orderId: [''],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      email: [
        { value: currentUser?.email || '', disabled: this.isLoggedIn },
        [Validators.required, Validators.email],
      ],
      name: [
        { value: currentUser?.name || '', disabled: this.isLoggedIn },
        [Validators.required, Validators.maxLength(30)],
      ],
    });
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields properly.');
      return;
    }

    this.isSubmitting = true;
    const rawValues = this.complaintForm.getRawValue();

    const payload = {
      ...rawValues,
      orderId: rawValues.orderId?.trim() ? rawValues.orderId.trim() : null,
    };

    this.complaintService.createComplaint(payload).subscribe({
      next: (res) => {
        this.toastr.success(
          'Your complaint has been submitted successfully. We will review it shortly!',
        );
        this.resetForm();
        // if (this.isLoggedIn) {
        //   this.fetchUserComplaints();
        // }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to submit complaint. Please try again.');
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  // fetchUserComplaints(): void {
  //   this.isLoadingHistory = true;
  //   this.complaintService.getUserComplaints().subscribe({
  //     next: (res) => {
  //       this.userComplaints = res?.data || res?.complaints || [];
  //       this.isLoadingHistory = false;
  //       this.cdr.markForCheck();
  //     },
  //     error: () => {
  //       this.isLoadingHistory = false;
  //       this.cdr.markForCheck();
  //     },
  //   });
  // }

  private resetForm(): void {
    const currentUser = this.authService.decodedUserData();
    this.complaintForm.reset({
      service: '',
      subject: '',
      orderId: '',
      description: '',
      email: currentUser?.email || '',
      name: currentUser?.name || '',
    });

    if (this.isLoggedIn) {
      this.complaintForm.get('email')?.disable();
    }
    if (this.isLoggedIn) {
      this.complaintForm.get('name')?.disable();
    }
  }

  get f() {
    return this.complaintForm.controls;
  }
}

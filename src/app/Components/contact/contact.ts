import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintsService } from '../../core/services/complaints';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  private complaintsService = inject(ComplaintsService);

  public name = '';
  public email = '';
  public subject = '';
  public service = '';
  public message = '';
  public statusMessage = '';
  public isLoading = false;
  public isError = false;

  // الـ options الجاية من الـ schema في الباك اند
  public serviceOptions: string[] = [
    'Delivery',
    'Food Quality',
    'Payment Issue',
    'App Bug',
    'Other',
  ];

  public submitForm(): void {
    this.isLoading = true;
    this.statusMessage = '';
    this.isError = false;

    const complaintData = {
      name: this.name.trim(),
      email: this.email.trim(),
      subject: this.subject.trim(),
      service: this.service,
      message: this.message.trim(),
    };

    this.complaintsService.createComplaint(complaintData).subscribe({
      next: () => {
        this.isLoading = false;
        this.statusMessage = 'Message sent successfully.';
        this.isError = false;
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.statusMessage =
          err?.error?.message || 'Something went wrong. Please try again.';
        this.isError = true;
      },
    });
  }

  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.subject = '';
    this.service = '';
    this.message = '';
  }
}
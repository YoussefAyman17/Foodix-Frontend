import { ChangeDetectorRef, Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { ComplaintsService } from '../../core/services/complaints';
import { ToastrService } from 'ngx-toastr';

interface Complaint {
  _id: string;
  subject: string;
  service: string;
  status: 'pending' | 'in process' | 'resolved' | 'rejected';
  createdAt: string;
  description?: string;
  adminResponse?: string;
  response?: string;
}

interface UserProfile {
  userName: string;
  email: string;
  phone?: string;
  profilePic?: string;
  address: Array<{ governorate?: string; city?: string; street?: string }>;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage implements OnInit {
  private authService = inject(Auth);
  private complaintsService = inject(ComplaintsService);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  // Form definition
  changePasswordForm: FormGroup = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{6,}$/),
      ]),
      repeatPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{6,}$/),
      ]),
    },
    { validators: this.checkRepassword },
  );

  // Page state signals
  isPageLoading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  // Password signals & state
  isUpdatingPassword = signal<boolean>(false);
  passSuccessMsg = signal<string>('');
  passErrorMsg = signal<string>('');

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Safe default user initialization
  user: UserProfile = {
    userName: '',
    email: '',
    phone: '',
    profilePic: '',
    address: [{ governorate: '', city: '', street: '' }],
  };

  // Complaints state
  isComplaintsLoading = signal<boolean>(false);
  myComplaints: Complaint[] = [];
  selectedComplaint: Complaint | null = null;
  isUpdatingComplaintStatus = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchUserProfile();
      this.fetchUserComplaints();
    }
  }

  // SSR Safe Toastr Helper
  private showToast(type: 'success' | 'error', message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      if (type === 'success') {
        this.toastr.success(message);
      } else {
        this.toastr.error(message);
      }
    }
  }

  checkRepassword(group: AbstractControl) {
    const newPass = group.get('newPassword')?.value;
    const repeatPass = group.get('repeatPassword')?.value;
    return newPass && repeatPass && newPass === repeatPass ? null : { mismatch: true };
  }

  closeComplaintModal(): void {
    this.selectedComplaint = null;
  }

  viewComplaintDetails(complaint: Complaint): void {
    this.selectedComplaint = complaint;
  }

  updateComplaintStatus(complaintId: string, newStatus: 'resolved' | 'in process'): void {
    if (!this.selectedComplaint) return;

    this.isUpdatingComplaintStatus.set(true);
    this.complaintsService.updateComplaint(complaintId, newStatus).subscribe({
      next: () => {
        this.showToast('success', 'Complaint status updated successfully');
        if (this.selectedComplaint) {
          this.selectedComplaint.status = newStatus;
        }
        const index = this.myComplaints.findIndex((c) => c._id === complaintId);
        if (index !== -1) {
          this.myComplaints[index].status = newStatus;
        }
        this.isUpdatingComplaintStatus.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('error', 'Failed to update complaint');
        this.isUpdatingComplaintStatus.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  fetchUserProfile(): void {
    this.isPageLoading.set(true);
    this.authService.getMyProfileApi().subscribe({
      next: (res: any) => {
        const rawData = res?.data || res;

        // Normalize address object or array safely
        let normalizedAddress = [{ governorate: '', city: '', street: '' }];
        if (Array.isArray(rawData?.address) && rawData.address.length > 0) {
          normalizedAddress = rawData.address;
        } else if (rawData?.address && typeof rawData.address === 'object') {
          normalizedAddress = [rawData.address];
        }

        this.user = {
          ...rawData,
          address: normalizedAddress,
        };

        this.isPageLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isPageLoading.set(false);
        this.cdr.detectChanges();
        this.showToast('error', 'Failed to load Profile');
      },
    });
  }

  fetchUserComplaints(): void {
    this.isComplaintsLoading.set(true);
    this.complaintsService.getMyComplaints().subscribe({
      next: (res: any) => {
        this.myComplaints = res?.data || res || [];
        this.isComplaintsLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isComplaintsLoading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
  }

  getUserInitial(): string {
    return this.user?.userName ? this.user.userName.charAt(0).toUpperCase() : 'U';
  }

  saveChanges(): void {
    this.isLoading.set(true);

    const firstAddress = this.user.address?.[0] || {};
    const payload = {
      ...this.user,
      address: {
        governorate: firstAddress.governorate || '',
        city: firstAddress.city || '',
        street: firstAddress.street || '',
      },
    };

    this.authService.updateMyProfileApi(payload).subscribe({
      next: () => {
        this.showToast('success', 'Profile updated successfully!');
        this.successMessage.set('Profile updated successfully!');
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to update profile.');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  updatePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.passSuccessMsg.set('');
    this.passErrorMsg.set('');
    this.isUpdatingPassword.set(true);

    const { currentPassword, newPassword } = this.changePasswordForm.value;
    const payload = { currentPassword, newPassword };

    this.authService.updateMyPasswordApi(payload).subscribe({
      next: () => {
        this.showToast('success', 'Password updated successfully!');
        this.passSuccessMsg.set('Password updated successfully!');
        this.changePasswordForm.reset();
        this.isUpdatingPassword.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast('error', 'Failed to update password.');
        this.passErrorMsg.set(err.error?.message || 'Failed to update password.');
        this.isUpdatingPassword.set(false);
        this.cdr.detectChanges();
      },
    });
  }
}

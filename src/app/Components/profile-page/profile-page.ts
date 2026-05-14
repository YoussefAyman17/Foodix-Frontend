import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isPageLoading = signal<boolean>(true);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  user = {
    userName: '',
    email: '',
    phone: '',
    profilePic: '',
    address: {
      governorate: '',
      city: '',
      street: '',
    },
  };

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isPageLoading.set(false);
      return;
    }

    this.loadUserData();
  }

  loadUserData(): void {
    this.isPageLoading.set(true);
    this.userService.getMyProfile().subscribe({
      next: (res) => {
        const u = res.user;
        this.user.userName = u.userName || '';
        this.user.email = u.email || '';
        this.user.phone = u.phone || '';
        this.user.profilePic = u.profilePic || '';
        const addr = u.address?.[0];
        this.user.address.governorate = addr?.governorate || '';
        this.user.address.city = addr?.city || '';
        this.user.address.street = addr?.street || '';
        this.isPageLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isPageLoading.set(false);
      },
    });
  }

  getUserInitial(): string {
    return this.user.userName?.charAt(0).toUpperCase() || 'U';
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  saveChanges(): void {
    this.isLoading.set(true);

    const updateData: any = {
      userName: this.user.userName,
    };

    if (this.user.phone.trim()) {
      updateData.phone = this.user.phone.trim();
    }

    const address = {
      governorate: this.user.address.governorate.trim(),
      city: this.user.address.city.trim(),
      street: this.user.address.street.trim(),
    };

    if (address.governorate || address.city || address.street) {
      updateData.address = [address];
    }

    this.userService.updateMyProfile(updateData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.successMessage.set('Profile updated successfully!');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Something went wrong!');
      },
    });
  }

  changePassword(): void {
    this.router.navigate(['/forgotPassword']);
  }
}

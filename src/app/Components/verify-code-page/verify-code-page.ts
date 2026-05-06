import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-verify-code-page',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-code-page.html',
  styleUrl: './verify-code-page.css',
})
export class VerifyCodePage {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  verifyForm: FormGroup = new FormGroup({
    resetCode: new FormControl(null, [Validators.required, Validators.pattern(/^\d{6}$/)]),
  });

  verifySubmit() {
    if (this.verifyForm.valid) {
      this.errorMessage.set('');
      const { resetCode } = this.verifyForm.value;
      const userData = { resetCode };
      this.isLoading.set(true);
      this.auth.verifyApi(userData).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.router.navigate(['/resetPassword']);
        },
        error: (err) => {
          this.errorMessage.set(err.error.message);
          this.isLoading.set(false);
          console.log(this.verifyForm);
        },
      });
    }
  }

  resendCode() {
    const userEmail = localStorage.getItem('UserEmail');
    if (userEmail) {
      this.isLoading.set(true);

      this.auth.forgotPassApi({ email: userEmail }).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.errorMessage.set('Code resent successfully');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Something went wrong');
        },
      });
    } else {
      this.errorMessage.set('Email not found, please start over.');
    }
  }
}

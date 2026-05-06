import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [RouterModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.css',
})
export class ForgotPasswordPage {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });

  forgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.errorMessage.set('');
      const { email } = this.forgotPasswordForm.value;
      const userData = { email };
      this.isLoading.set(true);
      this.auth.forgotPassApi(userData).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          localStorage.setItem('UserEmail', email);
          this.router.navigate(['/verifyCode']);
        },
        error: (err) => {
          this.errorMessage.set(err.error.message);
          this.isLoading.set(false);
        },
      });
    }
  }
}

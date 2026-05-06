import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';
@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.css',
})
export class ResetPasswordPage {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  resetPassForm: FormGroup = new FormGroup(
    {
      newPassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/),
      ]),
      repeatPassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/),
      ]),
    },
    this.checkRepassword,
  );

  resetPassSubmit() {
    if (this.resetPassForm.valid) {
      const email = localStorage.getItem('UserEmail');
      this.errorMessage.set('');
      const { newPassword } = this.resetPassForm.value;
      const userData = { email, newPassword };
      this.isLoading.set(true);
      this.auth.resetPassApi(userData).subscribe({
        next: (res) => {
          this.router.navigate(['/login']);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error.message);
          this.isLoading.set(false);
        },
      });
    }
  }

  checkRepassword(comp: AbstractControl) {
    if (comp.get('newPassword')?.value === comp.get('repeatPassword')?.value) {
      return null;
    } else {
      return { notMatched: true };
    }
  }
}

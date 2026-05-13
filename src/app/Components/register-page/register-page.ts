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
  selector: 'app-register-page',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  registerForm: FormGroup = new FormGroup(
    {
      userName: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{6,}$/),
      ]),
      repeatPassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{6,}$/),
      ]),
      agree: new FormControl(false, [Validators.requiredTrue]),
    },
    this.checkRepassword,
  );

  registerSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage.set('');
      const { userName, email, password, repeatPassword } = this.registerForm.value;
      const userData = { userName, email, password, repeatPassword };
      this.isLoading.set(true);
      this.auth.registerApi(userData).subscribe({
        next: (res) => {
          this.router.navigate(['/login']);
          this.isLoading.set(false);
          // console.log(this.registerForm);
        },
        error: (err) => {
          this.errorMessage.set(err.error.message);
          this.isLoading.set(false);
          // console.log(this.errorMessage);
        },
      });
    }
  }

  // custom validation
  checkRepassword(comp: AbstractControl) {
    if (comp.get('password')?.value === comp.get('repeatPassword')?.value) {
      return null;
    } else {
      return { notMatched: true };
    }
  }
}

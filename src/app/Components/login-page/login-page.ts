import { Component, signal, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { email } from '@angular/forms/signals';
import { Router, RouterLink, RouterModule } from '@angular/router';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  constructor(
    private auth: Auth,
    private router: Router,
    private renderer: Renderer2,
  ) {}

  // for background colour
  // export class LoginPage implement OnInit,OnDestroy
  // ngOnInit() {
  //   this.renderer.addClass(document.body, 'auth-bg');
  // }

  // ngOnDestroy() {
  //   this.renderer.removeClass(document.body, 'auth-bg');
  // }

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/),
    ]),
  });
  loginSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      const { email, password } = this.loginForm.value;
      const userData = { email, password };
      this.isLoading.set(true);
      this.auth.loginApi(userData).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          localStorage.setItem('userToken', res.token);
          this.auth.userData();
          // this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage.set(err.error.message);
          this.isLoading.set(false);
        },
      });
    }
  }
}

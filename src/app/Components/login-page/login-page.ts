import { Component, signal, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { email } from '@angular/forms/signals';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../core/services/auth';
declare var google: any;
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
  ) {}
  private toastr = inject(ToastrService);
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  // login with google
  ngAfterViewInit(): void {
    this.initGoogle();
  }

  initGoogle() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '576818685459-qtd0h48oflhfo62fpnd549oi23s5sr8n.apps.googleusercontent.com',
        callback: (res: any) => this.handelGoogle(res),
      });

      google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: '350',
      });
    } else {
      setTimeout(() => this.initGoogle(), 300);
    }
  }

  handelGoogle(res: any) {
    const idToken = res.credential;
    this.auth.loginWithGoogleApi({ idToken }).subscribe({
      next: (resp) => {
        this.auth.saveToken(resp.data?.token);
        this.toastr.success('Welcome back!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set(err.error.message);
      },
    });
  }

  // login
  loginSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      const { email, password } = this.loginForm.value;
      const userData = { email, password };
      this.isLoading.set(true);
      this.auth.loginApi(userData).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.auth.saveToken(res.data?.token);
          this.toastr.success('Welcome back!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage.set(err.error.message);
          this.toastr.error(err.error?.message || 'Login failed');
          this.isLoading.set(false);
        },
      });
    }
  }
}

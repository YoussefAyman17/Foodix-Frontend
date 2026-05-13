import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userInitial: string = '';
  // auth = inject(Auth);
  constructor(public auth: Auth) {}

  ngOnInit(): void {
    // بنجيب البيانات من الـ token اللي موجود
    this.auth.userData();
    const decoded = this.auth.decodedUserData();
    if (decoded) {
      this.userName = decoded.name || decoded.userName || 'User';
      this.userEmail = decoded.email || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }
}

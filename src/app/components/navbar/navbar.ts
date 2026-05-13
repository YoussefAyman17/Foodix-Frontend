import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth';

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

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    // بنجيب البيانات من الـ token اللي موجود
    this.auth.userData();
    const decoded = this.auth.decodedUserData;
    if (decoded) {
      this.userName = decoded.name || decoded.userName || 'User';
      this.userEmail = decoded.email || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }
}

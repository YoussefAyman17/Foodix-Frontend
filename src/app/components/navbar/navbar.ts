import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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

  constructor(
    public auth: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.userData();
    const decoded = this.auth.decodedUserData();
    if (decoded) {
      this.userName = decoded.name || decoded.userName || 'User';
      this.userEmail = decoded.email || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }

  logout(): void {
    localStorage.removeItem('userToken');
    this.auth.decodedUserData.set(null);
    this.router.navigate(['/login']);
  }
}
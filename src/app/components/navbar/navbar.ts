import { Component, inject, OnInit, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, UserPayload } from '../../core/services/auth';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public cartService = inject(CartService);
  authService = inject(Auth);

  currentUser = this.authService.decodedUserData;
  userInitial = computed(() => {
    const name = this.currentUser()?.name;
    return name ? name.charAt(0).toUpperCase() : '?';
  });
  constructor(
    public auth: Auth,
    private router: Router,
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

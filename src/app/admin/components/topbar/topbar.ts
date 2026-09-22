import { Component, inject, computed } from '@angular/core';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  authService = inject(Auth);

  currentUser = this.authService.decodedUserData;
  userInitial = computed(() => {
    const name = this.currentUser()?.name;
    return name ? name.charAt(0).toUpperCase() : '?';
  });
  constructor(public auth: Auth) {}
}

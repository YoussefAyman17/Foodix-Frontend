import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DashboardService } from '../../services/dashboard'; // Adjust path as needed

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private dashboardService = inject(DashboardService);

  // State Signals
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Data Signals
  stats = signal({
    totalRevenue: 0,
    todayOrdersCount: 0,
    activeCustomersCount: 0,
    pendingComplaintsCount: 0,
  });
  recentOrders = signal<any[]>([]);
  topMeals = signal<any[]>([]);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getHomeStats().subscribe({
      next: (res) => {
        this.stats.set(res.data.stats);
        this.recentOrders.set(res.data.recentLiveOrders);
        this.topMeals.set(res.data.topSellingMeals);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'preparing':
        return 'status-preparing';
      case 'out_for_delivery':
      case 'out for delivery':
        return 'status-delivery';
      default:
        return 'bg-light text-dark';
    }
  }
}

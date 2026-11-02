import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardResponse {
  status: string;
  data: {
    stats: {
      totalRevenue: number;
      todayOrdersCount: number;
      activeCustomersCount: number;
      pendingComplaintsCount: number;
    };
    recentLiveOrders: any[];
    topSellingMeals: any[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  getHomeStats() {
    return this.http.get<DashboardResponse>(`${environment.apiURL}dashboard/home-stats`);
  }
}

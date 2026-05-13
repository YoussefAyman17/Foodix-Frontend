import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 عشان الـ ngFor والـ ngClass

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome {
  recentOrders = [
    {
      id: '#ORD-2891',
      customer: 'Ahmed Hassan',
      items: 'Grilled Chicken, Caesar Salad',
      total: '285',
      status: 'Pending',
    },
    {
      id: '#ORD-2890',
      customer: 'Sarah Mohamed',
      items: 'Margherita Pizza, Soft Drink',
      total: '180',
      status: 'Preparing',
    },
    {
      id: '#ORD-2889',
      customer: 'Omar Ali',
      items: 'Beef Burger, Fries, Cola',
      total: '220',
      status: 'Out for Delivery',
    },
    {
      id: '#ORD-2888',
      customer: 'Fatma Ibrahim',
      items: 'Seafood Pasta, Garlic Bread',
      total: '320',
      status: 'Preparing',
    },
  ];

  topMeals = [
    { name: 'Grilled Chicken Special', sales: 248, rank: 1 },
    { name: 'Margherita Pizza', sales: 189, rank: 2 },
    { name: 'Beef Burger Deluxe', sales: 156, rank: 3 },
  ];

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Preparing':
        return 'status-preparing';
      case 'Out for Delivery':
        return 'status-delivery';
      default:
        return 'bg-light text-dark';
    }
  }
}

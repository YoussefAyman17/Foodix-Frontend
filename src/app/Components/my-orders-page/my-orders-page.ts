import {
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from '../../admin/services/order';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './my-orders-page.html',
  styleUrl: './my-orders-page.css',
})
export class MyOrdersPage implements OnInit {
  isLoading = signal<boolean>(true);
  orders = signal<any[]>([]);
  filteredOrders = signal<any[]>([]);
  activeFilter = signal<string>('All');
  searchQuery = signal<string>('');

  selectedOrder = signal<any>(null);
  activeModal = signal<'details' | 'track' | null>(null);

  cdr = inject(ChangeDetectorRef);
  filters = ['All', 'Preparing', 'On the way', 'Delivered', 'Pending', 'Cancelled'];

  constructor(
    private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }
    this.loadOrders();
  }

  openDetailsModal(order: any) {
    this.selectedOrder.set(order);
    this.activeModal.set('details');
    document.body.style.overflow = 'hidden';
  }

  openTrackModal(order: any) {
    this.selectedOrder.set(order);
    this.activeModal.set('track');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedOrder.set(null);
    this.activeModal.set(null);
    document.body.style.overflow = 'auto';
  }
  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        console.log(res.orders);
        const data = res.orders || [];
        this.orders.set(data);
        this.filteredOrders.set(data);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
    this.applyFilters();
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.orders();

    if (this.activeFilter() !== 'All') {
      result = result.filter((o) => o.status === this.activeFilter());
    }

    const q = this.searchQuery().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          ('FDX-' + o.orderId).toLowerCase().includes(q) ||
          o.orderItems?.some((item: any) => item.name?.toLowerCase().includes(q)),
      );
    }

    this.filteredOrders.set(result);
  }

  getStatusClass(status: string): string {
    const map: any = {
      Preparing: 'status-preparing',
      'On the way': 'status-onway',
      Delivered: 'status-delivered',
      Pending: 'status-pending',
      Cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }

  getProgressValue(status: string): number {
    const map: any = {
      Pending: 5,
      Preparing: 30,
      'On the way': 75,
      Delivered: 100,
      Cancelled: 0,
    };
    return map[status] || 0;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' - ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }
}

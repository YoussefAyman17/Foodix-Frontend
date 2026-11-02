import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from '../../admin/services/order';
import { RouterLink } from '@angular/router';
import { SocketService } from '../../core/services/socket-service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './my-orders-page.html',
  styleUrl: './my-orders-page.css',
})
export class MyOrdersPage implements OnInit, OnDestroy {
  private socketService = inject(SocketService);
  private toastr = inject(ToastrService);

  private subscriptions = new Subscription();
  isLoading = signal<boolean>(true);
  orders = signal<any[]>([]);
  activeFilter = signal<string>('All');
  searchQuery = signal<string>('');

  // Derived automatically from orders + filter + search, so socket updates show up
  filteredOrders = computed(() => {
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
    return result;
  });

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

    this.subscriptions.add(
      this.socketService
        .listen<{
          orderId: string;
          orderCode: number | string;
          status: string;
        }>('orderStatusChanged')
        .subscribe((data) => {
          const isSame = (o: any) =>
            String(o._id) === String(data.orderId) || String(o.orderId) === String(data.orderCode);

          this.orders.update((list) =>
            list.map((o) => (isSame(o) ? { ...o, status: data.status } : o)),
          );

          // keep an open modal in sync too
          const selected = this.selectedOrder();
          if (selected && isSame(selected)) {
            this.selectedOrder.set({ ...selected, status: data.status });
          }

          this.toastr.info(`Order #${data.orderCode} is now ${data.status}`, 'Order Update');
        }),
    );
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
        this.orders.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
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
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' - ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto'; // don't leave the page locked if a modal was open
    this.subscriptions.unsubscribe();
  }
}

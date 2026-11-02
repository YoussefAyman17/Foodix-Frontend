import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../interfaces/order';
import { OrderService } from '../../services/order';
import { SocketService } from '../../../core/services/socket-service';

interface StatusChangedPayload {
  orderId: string; // Mongo _id
  orderCode?: number | string; // the order number
  status: Order['status'];
}

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  templateUrl: './manage-orders.html',
  imports: [CommonModule],
  styleUrls: ['./manage-orders.css'],
})
export class ManageOrders implements OnInit, OnDestroy {
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  private orderService = inject(OrderService);
  private socketService = inject(SocketService);
  private subscriptions = new Subscription();

  private isReloading = false;
  private reloadQueued = false;

  orders = signal<Order[]>([]);
  deliveryPersons = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  activeModal = signal<'view' | 'assignDelivery' | null>(null);
  selectedOrder = signal<Order | null>(null);

  // Same names as before, so the template's stats keep working (they are now computed)
  totalOrders = computed(() => this.orders().length);
  pendingOrders = computed(() => this.orders().filter((o) => o.status === 'Pending').length);
  preparingOrders = computed(() => this.orders().filter((o) => o.status === 'Preparing').length);
  outForDeliveryOrders = computed(
    () => this.orders().filter((o) => o.status === 'On the way').length,
  );
  deliveredOrders = computed(() => this.orders().filter((o) => o.status === 'Delivered').length);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadOrders();
    this.listenToLiveUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ---------------------------------------------------------------- sockets

  private listenToLiveUpdates(): void {
    this.socketService.joinAdminRoom();

    this.subscriptions.add(
      this.socketService
        .listen<{ orderCode: number; totalPrice: number; itemsCount: number }>('newOrderCreated')
        .subscribe((d) => {
          this.toastr.success(
            `New order #FDX-${d.orderCode}: ${d.itemsCount} item(s), ${d.totalPrice} EGP`,
            'New Order',
          );
          this.loadOrders(false);
        }),
    );

    // Order status changes (also fired when a driver is assigned or declines)
    this.subscriptions.add(
      this.socketService.listen<StatusChangedPayload>('orderStatusChanged').subscribe((data) => {
        if (!data?.orderId) return;

        const existing = this.orders().find(
          (o: any) =>
            String(o._id) === String(data.orderId) ||
            (data.orderCode !== undefined && String(o.orderId) === String(data.orderCode)),
        );

        // Show the toast only when the status really changed
        if (existing && existing.status !== data.status) {
          this.patchOrder(existing, { status: data.status });
          this.toastr.info(`Order #FDX-${existing.orderId} is now ${data.status}`);
        }

        // The payload is small, so reload to pick up the driver and other fields
        this.loadOrders(false);
      }),
    );

    // A driver went online or offline
    this.subscriptions.add(
      this.socketService
        .listen<{ workerId: string; isOnline: boolean }>('workerStatusChanged')
        .subscribe(() => {
          if (this.activeModal() === 'assignDelivery') this.loadWorkers();
        }),
    );

    // A driver declined an order
    this.subscriptions.add(
      this.socketService.listen<{ orderCode: number }>('orderDeclined').subscribe((d) => {
        this.toastr.warning(`Order #FDX-${d.orderCode} was declined. Please reassign it.`);
        this.loadOrders(false);
      }),
    );
  }

  private patchOrder(order: Order, changes: Partial<Order>): void {
    this.orders.update((list) => list.map((o) => (o === order ? { ...o, ...changes } : o)));
  }

  // ----------------------------------------------------------------- orders

  /** showSpinner = false makes a silent reload (used after socket events). */
  loadOrders(showSpinner = true): void {
    if (this.isReloading) {
      this.reloadQueued = true; // run once more when the current request finishes
      return;
    }
    this.isReloading = true;
    if (showSpinner) this.isLoading.set(true);

    this.orderService.getAllOrders().subscribe({
      next: (response: any) => {
        let fetched: any[] = [];

        if (Array.isArray(response)) {
          fetched = response;
        } else if (Array.isArray(response?.data)) {
          fetched = response.data;
        } else if (Array.isArray(response?.data?.orders)) {
          fetched = response.data.orders;
        } else if (typeof response?.data === 'object' && response?.data !== null) {
          fetched = Object.values(response.data);
        }

        this.orders.set(
          [...fetched].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );

        // keep an open modal showing fresh data
        const selected: any = this.selectedOrder();
        if (selected) {
          const fresh = this.orders().find((o: any) => o.orderId === selected.orderId);
          if (fresh) this.selectedOrder.set(fresh);
        }

        this.finishReload();
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading.set(false);
        if (showSpinner && isPlatformBrowser(this.platformId)) {
          this.toastr.error('Failed to load live orders', 'Error');
        }
        this.finishReload();
      },
    });
  }

  private finishReload(): void {
    this.isLoading.set(false);
    this.isReloading = false;
    if (this.reloadQueued) {
      this.reloadQueued = false;
      this.loadOrders(false);
    }
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const diffInMinutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  updateOrderStatus(order: Order, newStatus: Order['status']): void {
    if (!order?.orderId) return;

    this.orderService.updateOrderStatus(order.orderId, newStatus).subscribe({
      next: () => {
        // Update right away. The socket event that follows won't repeat the toast.
        this.patchOrder(order, { status: newStatus });
        this.toastr.success(`Order #FDX-${order.orderId} moved to ${newStatus}`);
        this.loadOrders(false);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.toastr.error(err.error?.message || 'Failed to update order status');
      },
    });
  }

  // ----------------------------------------------------------------- modals

  openModal(modalType: 'view', order: Order): void {
    this.selectedOrder.set(order);
    this.activeModal.set(modalType);
  }

  openAssignModal(order: Order): void {
    this.selectedOrder.set(order);
    this.activeModal.set('assignDelivery');
    this.loadWorkers();
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.selectedOrder.set(null);
  }

  // ---------------------------------------------------------------- drivers

  loadWorkers(): void {
    this.orderService.getAllDeliveryPersons().subscribe({
      next: (res: any) => {
        this.deliveryPersons.set(
          Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [],
        );
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load delivery persons');
      },
    });
  }

  /** Assigned to a driver who hasn't accepted yet */
  isAwaitingDriver(order: any): boolean {
    return order.deliveryPerson && ['Pending', 'Preparing'].includes(order.status);
  }

  assignDriver(driver: any): void {
    if (driver?.isBusy) {
      this.toastr.warning('This driver is busy');
      return;
    }

    const order = this.selectedOrder();
    if (!order?.orderId || !driver?._id) return;

    this.orderService.assignDeliveryPerson(order.orderId, driver._id).subscribe({
      next: () => {
        this.toastr.success('Driver assigned successfully');
        this.closeModal();
        this.loadOrders(false);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Failed to assign driver');
      },
    });
  }
}

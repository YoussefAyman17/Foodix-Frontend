import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectorRef,
  isDevMode,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../admin/services/order';
import { SocketService } from '../../../core/services/socket-service';
import { DeliveryService } from '../../../core/services/delivery';
import { Auth } from '../../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

type OrderFilter = 'Running' | 'All' | 'Completed';
const DONE_STATUSES = ['Delivered', 'Cancelled'];
const LOCATION_INTERVAL_MS = 4000;

@Component({
  selector: 'app-delivery-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-home.html',
  styleUrls: ['./delivery-home.css'],
})
export class DeliveryHome implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private socketService = inject(SocketService);
  public authService = inject(Auth);
  private deliveryService = inject(DeliveryService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);

  // Starts offline: the server marks the driver offline when the page closes
  isOnline = signal(false);
  isLoading = signal(true);
  orders = signal<any[]>([]);
  activeFilter = signal<OrderFilter>('Running');
  processingOrderId = signal<string | null>(null);
  readonly filters: OrderFilter[] = ['Running', 'All', 'Completed'];

  isDone = (o: any) => DONE_STATUSES.includes(o.status);
  /** Assigned but not accepted yet */
  needsResponse = (o: any) => !this.isDone(o) && o.status !== 'On the way';

  filteredOrders = computed(() => {
    const list = this.orders();
    switch (this.activeFilter()) {
      case 'Running':
        return list.filter((o) => !this.isDone(o));
      case 'Completed':
        return list.filter((o) => this.isDone(o));
      default:
        return list;
    }
  });

  runningCount = computed(() => this.orders().filter((o) => !this.isDone(o)).length);
  awaitingCount = computed(() => this.orders().filter((o) => this.needsResponse(o)).length);
  deliveredCount = computed(() => this.orders().filter((o) => o.status === 'Delivered').length);

  private subscriptions = new Subscription();
  private watchId?: number;
  private trackedOrderIds = new Set<string>();
  private lastSentAt = 0;

  // -------------------------------------------------- dev-only simulator
  readonly showSimulator = isDevMode();
  simulationOn = signal(false);
  autoDriving = signal(false);
  simPosition = signal({ lat: 30.0444, lng: 31.2357 });
  private autoTimer?: ReturnType<typeof setInterval>;

  toggleSimulation(on: boolean): void {
    this.simulationOn.set(on);
    if (on) this.sendSimulated();
    else this.stopAutoDrive();
  }

  setSimPosition(lat: number, lng: number): void {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
    this.simPosition.set({ lat, lng });
    this.sendSimulated();
  }

  /** ~0.0005 degrees is about 50 metres */
  nudge(dLat: number, dLng: number): void {
    const p = this.simPosition();
    this.setSimPosition(p.lat + dLat, p.lng + dLng);
  }

  toggleAutoDrive(): void {
    if (this.autoTimer) return this.stopAutoDrive();
    this.simulationOn.set(true);
    this.autoDriving.set(true);
    this.autoTimer = setInterval(() => this.nudge(0.00025, 0.0003), 2000);
  }

  private stopAutoDrive(): void {
    clearInterval(this.autoTimer);
    this.autoTimer = undefined;
    this.autoDriving.set(false);
  }

  private sendSimulated(): void {
    if (!this.simulationOn()) return;
    const { lat, lng } = this.simPosition();
    this.trackedOrderIds.forEach((id) => this.socketService.sendLocation(id, lat, lng));
  }

  // ----------------------------------

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.setupRealTimeListeners();
    this.loadOrders();
  }

  // ---------------------------------------------------------------- sockets

  private setupRealTimeListeners(): void {
    const userData = this.authService.decodedUserData();
    const workerId = userData?.workerId || userData?.id;
    if (!workerId) {
      console.warn('No workerId found in token. Socket listener NOT started.');
      return;
    }

    this.socketService.joinWorkerRoom(workerId, (res) => {
      if (!res.ok) this.toastr.error('Could not connect to live orders.', 'Connection');
    });

    // The admin gave the order to another driver
    this.subscriptions.add(
      this.socketService.listen<{ orderId: string }>('orderUnassigned').subscribe((data) => {
        const order = this.orders().find((o) => o._id === data.orderId);
        if (!order) return;
        this.orders.update((list) => list.filter((o) => o._id !== data.orderId));
        this.toastr.info(`Order #FDX-${order.orderId} was reassigned`, 'Order Update');
      }),
    );

    // New order assigned by the admin
    this.subscriptions.add(
      this.socketService.listen<{ order: any }>('newOrderAssigned').subscribe((data: any) => {
        const newOrder = data?.order || data;
        if (!newOrder?._id) return;

        this.orders.update((list) =>
          list.some((o) => o._id === newOrder._id)
            ? list.map((o) => (o._id === newOrder._id ? { ...o, ...newOrder } : o))
            : [newOrder, ...list],
        );
        this.toastr.info('New order assigned to you!', 'Order Update');
      }),
    );

    // Status changes made elsewhere (e.g. the admin cancels the order)
    this.subscriptions.add(
      this.socketService
        .listen<{ orderId: string; status: string }>('orderStatusChanged')
        .subscribe((data) => {
          const order = this.orders().find((o) => o._id === data.orderId);
          if (!order || order.status === data.status) return;

          this.orders.update((list) =>
            list.map((o) => (o._id === data.orderId ? { ...o, status: data.status } : o)),
          );
          if (DONE_STATUSES.includes(data.status)) {
            this.stopLocationTracking(data.orderId);
            if (data.status === 'Cancelled') {
              this.toastr.warning(`Order #FDX-${order.orderId} was cancelled`, 'Order Update');
            }
          }
        }),
    );
  }

  // ----------------------------------------------------------------- orders

  private loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getDeliveryOrders().subscribe({
      next: (res: any) => {
        const list = res.data || res;
        this.orders.set(Array.isArray(list) ? list : []);
        this.isLoading.set(false);

        // After a refresh, keep sending the location for orders already on the way
        this.orders()
          .filter((o) => o.status === 'On the way')
          .forEach((o) => this.startLocationTracking(o._id));
      },
      error: (err) => {
        console.error('Error fetching delivery orders:', err);
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter.set(filter);
  }

  acceptOrder(order: any): void {
    if (!order?._id || this.processingOrderId()) return;
    const id: string = order._id;
    this.processingOrderId.set(id);

    this.orderService.updateOrderStatus(order.orderId, 'On the way').subscribe({
      next: () => {
        this.toastr.success('Order accepted. Drive safe!');
        this.patchOrder(id, { status: 'On the way' });
        this.startLocationTracking(id);
        this.processingOrderId.set(null);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to accept order');
        this.processingOrderId.set(null);
      },
    });
  }

  declineOrder(order: any): void {
    if (!order?._id || this.processingOrderId()) return;
    if (!confirm(`Decline order #FDX-${order.orderId}?`)) return;
    const id: string = order._id;
    this.processingOrderId.set(id);

    this.orderService.declineOrder(order.orderId).subscribe({
      next: () => {
        this.orders.update((list) => list.filter((o) => o._id !== id));
        this.toastr.info('Order declined. The admin will reassign it.');
        this.processingOrderId.set(null);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to decline order');
        this.processingOrderId.set(null);
      },
    });
  }

  markDelivered(order: any): void {
    if (!order?._id || this.processingOrderId()) return;
    const id: string = order._id;
    this.processingOrderId.set(id);

    this.orderService.updateOrderStatus(order.orderId, 'Delivered').subscribe({
      next: () => {
        this.toastr.success('Order marked as delivered');
        this.patchOrder(id, { status: 'Delivered' });
        this.stopLocationTracking(id);
        this.processingOrderId.set(null);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to update order');
        this.processingOrderId.set(null);
      },
    });
  }

  toggleOnlineStatus(status: boolean): void {
    this.isOnline.set(status);
    this.deliveryService.updateStatus(status).subscribe({
      next: () =>
        this.toastr.success(
          status ? 'You are online and visible to the admin' : 'You are now offline',
        ),
      error: (err) => {
        console.error('Failed to update status:', err);
        this.toastr.error('Failed to update status');
        this.isOnline.set(!status);
      },
    });
  }

  private patchOrder(id: string, changes: object): void {
    this.orders.update((list) => list.map((o) => (o._id === id ? { ...o, ...changes } : o)));
  }

  // --------------------------------------------------------------- location

  isTracking(orderId: string): boolean {
    return this.trackedOrderIds.has(orderId);
  }

  startLocationTracking(orderId: string | number): void {
    if (!this.isBrowser || !('geolocation' in navigator)) return;

    this.trackedOrderIds.add(String(orderId));
    this.sendSimulated();
    if (!('geolocation' in navigator) || this.watchId !== undefined) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (this.simulationOn()) return;
        const now = Date.now();
        if (now - this.lastSentAt < LOCATION_INTERVAL_MS) return;
        this.lastSentAt = now;

        const { latitude: lat, longitude: lng } = position.coords;
        this.trackedOrderIds.forEach((id) => this.socketService.sendLocation(id, lat, lng));
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          this.toastr.warning('Allow location access so the customer can track you.', 'Location');
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );
  }

  stopLocationTracking(orderId?: string | number): void {
    if (orderId !== undefined) this.trackedOrderIds.delete(String(orderId));
    else this.trackedOrderIds.clear();

    if (this.trackedOrderIds.size === 0 && this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) this.stopLocationTracking();
    this.subscriptions.unsubscribe();
  }
}

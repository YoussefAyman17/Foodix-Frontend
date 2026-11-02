import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from '../../core/services/socket-service';
import { OrderService } from '../../core/services/order';

export interface OrderTrackingDetails {
  _id: string;
  orderId: string | number;
  status: 'Pending' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';
  totalPrice: number;
  deliveryPerson?: {
    userId?: {
      userName: string;
      phone: string;
    };
  };
  shippingAddress?: {
    street: string;
    area: string;
    city: string;
  };
}

interface StatusChangedPayload {
  orderId: string; // Mongo _id
  orderCode?: string | number;
  status: OrderTrackingDetails['status'];
}

interface LocationPayload {
  lat: number;
  lng: number;
  at?: number;
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-order.html',
  styleUrls: ['./track-order.css'],
})
export class TrackOrder implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private socketService = inject(SocketService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);

  orderId = signal<number | null>(null);
  order = signal<OrderTrackingDetails | null>(null);
  isLoading = signal<boolean>(true);
  driverLocation = signal<{ lat: number; lng: number } | null>(null);

  private subscriptions = new Subscription();
  private joinedRoomId: string | null = null;

  // Timeline definition used by the template
  readonly steps = [
    {
      key: 'Pending',
      title: 'Order received',
      text: 'The restaurant confirmed your order',
      icon: 'bi-receipt',
    },
    {
      key: 'Preparing',
      title: 'Preparing your meal',
      text: 'The kitchen is cooking your food',
      icon: 'bi-egg-fried',
    },
    {
      key: 'On the way',
      title: 'On the way',
      text: 'Your courier is heading to you',
      icon: 'bi-bicycle',
    },
    { key: 'Delivered', title: 'Delivered', text: 'Enjoy your meal!', icon: 'bi-check-lg' },
  ];

  /** Index of the current step, or -1 when cancelled */
  stepIndex = computed(() => {
    const status = this.order()?.status;
    return this.steps.findIndex((s) => s.key === status);
  });

  progressValue = computed(() => {
    const i = this.stepIndex();
    return i < 0 ? 0 : Math.round(((i + 1) / this.steps.length) * 100);
  });

  private L: any;
  private map: any;
  private driverMarker: any;
  private trail: any;
  private trailPoints: [number, number][] = [];
  private mapContainer?: HTMLElement;
  private readonly DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]; // Cairo

  constructor() {
    // Re-draws the marker every time a new driver location arrives
    effect(() => {
      const loc = this.driverLocation();
      if (loc) this.updateDriverMarker(loc.lat, loc.lng);
      else this.clearDriverMarker();
    });
  }

  // Runs when the #mapEl element is created (after the order loads)
  @ViewChild('mapEl') set mapEl(ref: ElementRef<HTMLElement> | undefined) {
    if (!ref || !isPlatformBrowser(this.platformId)) return;
    if (this.mapContainer === ref.nativeElement) return;
    this.mapContainer = ref.nativeElement;
    this.initMap();
  }

  private async initMap(): Promise<void> {
    if (!this.L) {
      const mod: any = await import('leaflet'); // browser only, so server-side rendering is safe
      this.L = mod.default ?? mod;
    }
    const L = this.L;
    if (!this.mapContainer) return;

    this.map?.remove();
    this.driverMarker = undefined;
    this.trailPoints = [];

    this.map = L.map(this.mapContainer).setView(this.DEFAULT_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
    this.trail = L.polyline([], { color: '#ea580c', weight: 4, opacity: 0.7 }).addTo(this.map);

    // The location may have arrived before the map was ready
    const loc = this.driverLocation();
    if (loc) this.updateDriverMarker(loc.lat, loc.lng);
  }

  private updateDriverMarker(lat: number, lng: number): void {
    if (!this.map || !this.L) return;
    const L = this.L;
    const pos: [number, number] = [lat, lng];

    if (!this.driverMarker) {
      const icon = L.divIcon({
        className: 'driver-pin',
        html: '<span class="pin-pulse"></span><i class="bi bi-bicycle"></i>',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      this.driverMarker = L.marker(pos, { icon }).addTo(this.map);
      this.map.setView(pos, 16);
    } else {
      this.driverMarker.setLatLng(pos);
      this.map.panTo(pos, { animate: true });
    }

    this.trailPoints.push(pos);
    this.trail?.setLatLngs(this.trailPoints);
  }

  private clearDriverMarker(): void {
    if (this.driverMarker) {
      this.driverMarker.remove();
      this.driverMarker = undefined;
    }
    this.trailPoints = [];
    this.trail?.setLatLngs([]);
  }

  statusMessage = computed(() => {
    switch (this.order()?.status) {
      case 'Pending':
        return 'We received your order';
      case 'Preparing':
        return 'Your meal is being prepared';
      case 'On the way':
        return 'Your courier is on the way';
      case 'Delivered':
        return 'Delivered. Enjoy your meal!';
      case 'Cancelled':
        return 'This order was cancelled';
      default:
        return '';
    }
  });

  /** done / active / '' for the step at index i */
  stepState(i: number): 'done' | 'active' | '' {
    const current = this.stepIndex();
    if (current < 0) return '';
    if (i < current) return 'done';
    if (i === current) return current === this.steps.length - 1 ? 'done' : 'active';
    return '';
  }

  mapsLink = computed(() => {
    const loc = this.driverLocation();
    return loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.orderId.set(id);
      this.fetchInitialOrderDetails(id);
    } else {
      this.isLoading.set(false);
    }
  }

  fetchInitialOrderDetails(id: number): void {
    this.orderService.trackOrder(id).subscribe({
      next: (res: any) => {
        const orderData = res.data || res;
        this.order.set(orderData);
        this.isLoading.set(false);

        if (isPlatformBrowser(this.platformId)) {
          this.setupSocketListeners(orderData._id);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastr.error(err.error?.message || 'Could not load the order', 'Error');
        this.cdr.detectChanges();
      },
    });
  }

  private setupSocketListeners(roomId: string): void {
    this.joinedRoomId = roomId;

    // The order room is used for the driver's live location
    this.socketService.joinOrderRoom(roomId, (res) => {
      if (!res.ok) {
        this.toastr.warning('Live location is not available for this order.', 'Notice');
      }
    });

    this.subscriptions.add(
      this.socketService.listen<StatusChangedPayload>('orderStatusChanged').subscribe((data) => {
        const current = this.order();
        if (!current) return;

        const isThisOrder =
          String(data.orderId) === String(current._id) ||
          (data.orderCode !== undefined && String(data.orderCode) === String(current.orderId));
        if (!isThisOrder) return;

        // Toast and status change only when the status really changed
        if (data.status !== current.status) {
          this.order.update((prev) => (prev ? { ...prev, status: data.status } : null));
          this.toastr.info(`Order #FDX-${current.orderId} is now ${data.status}`, 'Order Update');

          if (data.status === 'Delivered' || data.status === 'Cancelled') {
            this.driverLocation.set(null);
            this.leaveRoom();
          }
        }

        // ALWAYS reload the details: assigning a driver doesn't change the status,
        // and the socket payload doesn't include the driver's name and phone
        this.refreshOrderDetails();
      }),
    );

    this.subscriptions.add(
      this.socketService.listen<LocationPayload>('receiveLocation').subscribe((coords) => {
        if (this.order()?.status !== 'On the way') return;
        this.driverLocation.set({ lat: coords.lat, lng: coords.lng });
      }),
    );
  }

  // Silent reload (no spinner)
  private refreshOrderDetails(): void {
    const id = this.orderId();
    if (!id) return;
    this.orderService.trackOrder(id).subscribe({
      next: (res: any) => this.order.set(res.data || res),
    });
  }

  private leaveRoom(): void {
    if (this.joinedRoomId) {
      this.socketService.leaveOrderRoom(this.joinedRoomId);
      this.joinedRoomId = null;
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    if (isPlatformBrowser(this.platformId)) this.leaveRoom();
    this.subscriptions.unsubscribe();
  }
}

import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../interfaces/order';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.html',
  imports: [CommonModule],
  styleUrls: ['./manage-orders.css'],
})
export class ManageOrders implements OnInit {
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  deliveryPersons: any[] = [];
  isLoading: boolean = false;

  activeModal: 'view' | 'assignDelivery' | null = null;
  selectedOrder: Order | null = null;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;

    this.orderService.getAllOrders().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        let fetchedOrders = response.orders || response;

        if (!Array.isArray(fetchedOrders)) {
          fetchedOrders = Object.values(fetchedOrders);
        }

        this.orders = fetchedOrders.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading = false;
        this.cdr.detectChanges();

        if (isPlatformBrowser(this.platformId)) {
          this.toastr.error('Failed to load live orders', 'Error');
        }
      },
    });
  }

  get totalOrders() {
    return this.orders.length;
  }
  get pendingOrders() {
    return this.orders.filter((o) => o.status === 'Pending').length;
  }
  get preparingOrders() {
    return this.orders.filter((o) => o.status === 'Preparing').length;
  }
  get outForDeliveryOrders() {
    return this.orders.filter((o) => o.status === 'On the way').length;
  }
  get deliveredOrders() {
    return this.orders.filter((o) => o.status === 'Delivered').length;
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  updateOrderStatus(order: Order, newStatus: Order['status']) {
    if (!order._id) return;
    console.log(order.orderId, newStatus);
    this.orderService.updateOrderStatus(order.orderId, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
        this.loadOrders();
        this.cdr.detectChanges();
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.success(`Order #${order.orderId} moved to ${newStatus}`);
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.error(err.error?.message || 'Failed to update order status');
        }
      },
    });
  }

  openModal(modalType: 'view', order: Order) {
    this.selectedOrder = order;
    this.activeModal = modalType;
  }

  openAssignModal(order: Order) {
    this.selectedOrder = order;
    this.activeModal = 'assignDelivery';

    this.orderService.getAllDeliveryPersons().subscribe({
      next: (res: any) => {
        this.deliveryPersons = res.data || res;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load delivery persons');
      },
    });
  }

  assignDriver(driver: any) {
    if (driver.isBusy) {
      this.toastr.warning('This driver is busy');
      return;
    }

    if (!this.selectedOrder?.orderId) return;

    this.orderService.assignDeliveryPerson(this.selectedOrder.orderId, driver._id).subscribe({
      next: () => {
        this.toastr.success('Driver assigned successfully');
        this.closeModal();
        this.loadOrders();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to assign driver');
      },
    });
  }

  closeModal() {
    this.activeModal = null;
    this.selectedOrder = null;
  }
}

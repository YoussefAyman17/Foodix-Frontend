import {
  Component,
  OnInit,
  inject,
  signal,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order';
import { SocketService } from '../../../core/services/socket-service';
import { Auth } from '../../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

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
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);
  isOnline = signal(true);
  incomingOrders = signal<any[]>([]);

  performance = { deliveries: 8, earnings: 120 };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkCurrentOrders();
      this.setupRealTimeListener();
    }
  }

  setupRealTimeListener() {
    const userData = this.authService.decodedUserData();

    // 🌟 1. نشوف الداتا اللي راجعة من التوكن فيها workerId فعلاً ولا لأ؟
    console.log('1. Decoded Token Data:', userData);

    if (userData && userData.workerId) {
      const eventName = `newOrderFor_${userData.workerId}`;

      // 🌟 2. نطبع اسم الروم اللي الأنجلر بيسمع عليها عشان نقارنها بالباك إند
      console.log('2. 🎧 Frontend listening to Event:', eventName);

      this.socketService.listen(eventName).subscribe({
        next: (data: any) => {
          console.log('3. 🔥 SOCKET DATA ARRIVED!!', data);

          this.incomingOrders.update((orders) => [data.order, ...orders]);
          this.toastr.info('New Order Assigned to you!', 'Order Update');
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Socket Listen Error:', err),
      });
    } else {
      console.warn('⚠️ No workerId found in token. Socket listener NOT started.');
    }
  }

  // 2. جلب الأوردرات عند بدء التشغيل
  checkCurrentOrders() {
    this.orderService.getDeliveryOrders().subscribe({
      next: (res: any) => {
        const orders = res.data || res;
        const activeOrders = orders.filter(
          (o: any) => o.status !== 'Delivered' && o.status !== 'Cancelled',
        );
        this.incomingOrders.set(activeOrders);
      },
      error: (err) => {
        // 🌟 السطر ده بيخلي أنجلر يطبع الإيرور بهدوء من غير ما يوقع السيرفر
        console.error('Failed to fetch orders (probably SSR or no token):', err.message);
      },
    });
  }
  // 4. إرسال الموقع عبر Socket (إرسال الإحداثيات للغرفة الخاصة بالأوردر)
  startLocationTracking(orderId: number) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        this.socketService.emit('sendLocation', {
          orderId: orderId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }

  acceptOrder(orderId: number) {
    if (!orderId) return;

    // إرسال newStatus كما يتوقعه الباك إند في الـ Body
    this.orderService.updateOrderStatus(orderId, 'On the way').subscribe({
      next: (res) => {
        this.toastr.success('Order Accepted! You are on your way.');

        this.incomingOrders.update((orders) => orders.filter((o) => o._id !== orderId));

        this.startLocationTracking(orderId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Accept Order Error:', err);
        this.toastr.error('Failed to accept order');
      },
    });
  }

  rejectOrder(orderId: string) {
    // 🌟 نحذف الأوردر المعين من المصفوفة ونسيب باقي الأوردرات زي ما هي
    this.incomingOrders.update((orders) => orders.filter((o) => o._id !== orderId));
    this.toastr.info('Order skipped');
  }

  ngOnDestroy() {
    // تنظيف الاتصالات عند إغلاق الصفحة عشان ميفضلش يبعت لوكيشن في الخلفية
    // (لو عندك متغير حافظ فيه الـ interval بتاع اللوكيشن، وقفه هنا)
  }
}

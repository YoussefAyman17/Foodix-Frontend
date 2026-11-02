import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { CartService } from '../../core/services/cart';

type PayState = 'checking' | 'paid' | 'pending' | 'error';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.html',
})
export class PaymentSuccess implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  state = signal<PayState>('checking');
  orderCode = signal<number | null>(null);

  private timer?: ReturnType<typeof setInterval>;
  private attempts = 0;
  private readonly MAX_ATTEMPTS = 10; // 10 x 2s = 20 seconds

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = Number(this.route.snapshot.queryParamMap.get('orderId'));
    if (!id) {
      this.state.set('error');
      return;
    }
    this.orderCode.set(id);
    this.check(id);
    this.timer = setInterval(() => this.check(id), 2000);
  }

  private check(id: number): void {
    this.attempts++;

    this.orderService.trackOrder(id).subscribe({
      next: (res: any) => {
        const order = res.data || res;
        if (order.isPaid) {
          this.cartService.clearCart();
          this.state.set('paid');
          this.stop();
        } else if (this.attempts >= this.MAX_ATTEMPTS) {
          this.state.set('pending');
          this.stop();
        }
      },
      error: () => {
        if (this.attempts >= this.MAX_ATTEMPTS) {
          this.state.set('error');
          this.stop();
        }
      },
    });
  }

  private stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

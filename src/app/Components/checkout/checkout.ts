import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CartService } from '../../core/services/cart';
import { OrderService } from '../../admin/services/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  isSubmitting = false;

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public cartService = inject(CartService);
  private orderService = inject(OrderService);

  deliveryPrice: number = 30;

  ngOnInit(): void {
    this.initForm();
    const params = this.route.snapshot.queryParamMap;
    if (params.get('payment') === 'cancelled') {
      const orderCode = params.get('orderId');
      if (orderCode) {
        this.orderService.cancelUnpaidOrder(orderCode).subscribe({ error: () => {} });
      }
      this.toastr.info(
        'Payment was cancelled. Your cart is still here, so you can try again.',
        'Payment',
      );
      this.router.navigate([], { queryParams: {} });
    }
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        city: ['Cairo', Validators.required],
        area: ['', Validators.required],
        street: ['', Validators.required],
        building: [''],
        floor: [null],
        apartment: [null],
        contactPhone: ['', [Validators.required, Validators.pattern(/^(?:\+20|0)?1[0125]\d{8}$/)]],
        notes: [''],
      }),
      paymentMethod: ['Cash', Validators.required],
    });
  }

  get address() {
    return (this.checkoutForm.get('shippingAddress') as FormGroup).controls;
  }

  get totalPrice() {
    return this.cartService.subtotal() + this.deliveryPrice;
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toastr.warning('Please fill all required fields correctly.');
      return;
    }

    const currentItems = this.cartService.items();

    if (currentItems.length === 0) {
      this.toastr.error('Your cart is empty!');
      return;
    }

    this.isSubmitting = true;
    const formValues = this.checkoutForm.value;

    const formattedOrderItems = currentItems.map((item) => ({
      foodItem: item.mealId,
      size: item.selectedSize || 'Single', // Dynamic size mapping
      quantity: item.quantity,
      priceAtPurchase: item.price + (item.selectedSizePrice || 0),
    }));

    const orderPayload = {
      shippingAddress: formValues.shippingAddress,
      paymentMethod: formValues.paymentMethod,
      orderItems: formattedOrderItems,
      itemsPrice: this.cartService.subtotal(),
      deliveryPrice: this.deliveryPrice,
    };

    this.orderService.checkout(orderPayload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (formValues.paymentMethod === 'Stripe' && res.data?.url) {
          window.location.href = res.data.url;
        } else {
          this.toastr.success('Order placed successfully!');
          this.cartService.clearCart();
          this.router.navigate(['/my-orders-page']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Checkout Error:', err);
        this.toastr.error(err.error?.message || 'Failed to place order. Please try again.');
      },
    });
  }
}

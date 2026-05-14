import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

// استدعاء الخدمات
import { CartService } from '../../core/services/cart';
import { OrderService } from '../../admin/services/order';
import { Footer } from '../footer/footer';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer, Navbar],
  templateUrl: './checkout.html', // تأكد من مسار الـ HTML
  styleUrls: ['./checkout.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  isSubmitting = false;

  // حقن الخدمات (Injection)
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public cartService = inject(CartService); // خليناها public عشان نقرأ السجنالز في الـ HTML
  private orderService = inject(OrderService);

  // سعر التوصيل (ممكن تخليه ديناميكي لو تحب)
  deliveryPrice: number = 30;

  ngOnInit(): void {
    this.initForm();
  }

  // 1. تهيئة الفورم
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

  // لسهولة الوصول للحقول في الـ HTML
  get address() {
    return (this.checkoutForm.get('shippingAddress') as FormGroup).controls;
  }

  // حساب الإجمالي الكلي باستخدام الـ Signal بتاع الـ subtotal
  get totalPrice() {
    return this.cartService.subtotal() + this.deliveryPrice;
  }

  // 2. إرسال الطلب للباك إند
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

    // 🌟 تجميع عناصر الطلب (Mapping) لتطابق الـ Order Schema
    const formattedOrderItems = currentItems.map((item) => ({
      foodItem: item.mealId,
      // الـ Schema تتطلب Size، لو مش متخزن الاسم في الـ CartItem هنبعت قيمة افتراضية مقبولة في الـ Enum
      size: item.selectedSizePrice > 0 ? 'Single' : 'Single',
      quantity: item.quantity,
      priceAtPurchase: item.price + item.selectedSizePrice,
    }));

    // 🌟 تجهيز الـ Payload النهائي
    const orderPayload = {
      shippingAddress: formValues.shippingAddress,
      paymentMethod: formValues.paymentMethod,
      orderItems: formattedOrderItems,
      itemsPrice: this.cartService.subtotal(),
      deliveryPrice: this.deliveryPrice,
    };

    // 🌟 إرسال الريكويست باستخدام دالة checkout
    this.orderService.checkout(orderPayload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        // لو الدفع أونلاين عن طريق Stripe والباك إند رجع رابط الدفع
        if (formValues.paymentMethod === 'Stripe' && res.url) {
          window.location.href = res.url;
        }
        // لو الدفع كاش (Cash on Delivery)
        else {
          this.toastr.success('Order placed successfully!');

          // 🌟 تفريغ السلة بعد نجاح الطلب باستخدام دالة السيرفيس
          this.cartService.clearCart();

          // التوجيه لصفحة طلباتي
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

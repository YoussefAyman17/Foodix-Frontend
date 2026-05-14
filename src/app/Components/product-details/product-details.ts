import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MealService } from '../../core/services/meal';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  meal: any = null;
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  quantity = signal<number>(1);

  // 2. متغير السعر الإضافي (لو اختار حجم)
  selectedSizePrice = signal<number>(0);

  // 3. منتجات ذات صلة (يجب جلبها من الـ API)
  relatedItems = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}
  increaseQty() {
    this.quantity.update((q) => q + 1);
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  selectSize(event: any) {
    const selectedSizeName = event.target.value;
    const sizeObj = this.meal.sizes.find((s: any) => s.size === selectedSizeName);
    if (sizeObj) {
      this.selectedSizePrice.set(sizeObj.extraPrice);
    }
  }

  // دالة الإضافة للسلة
  addToCart() {
    // حساب السعر النهائي: (سعر الوجبة + سعر الحجم) * الكمية
    const finalPrice = (this.meal.price + this.selectedSizePrice()) * this.quantity();

    const cartItem = {
      mealId: this.meal._id,
      quantity: this.quantity(),
      totalPrice: finalPrice,
      // ... باقي التفاصيل
    };

    console.log('Added to cart:', cartItem);
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    const slug = this.route.snapshot.paramMap.get('slug') || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!slug || Number.isNaN(id)) {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid product link');
      return;
    }

    this.mealService.getMealById(slug, id).subscribe({
      next: (res) => {
        this.meal = res?.data || null;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Product not found');
        this.isLoading.set(false);
      },
    });
  }
}

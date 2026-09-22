import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MealService } from '../../core/services/meal';
import { CartService } from '../../core/services/cart';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { ToastrService } from 'ngx-toastr';

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
  selectedSizePrice = signal<number>(0);
  relatedItems = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    private cartService: CartService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  increaseQty(): void {
    this.quantity.update((q) => q + 1);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  selectSize(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const sizeObj = this.meal?.sizes?.find((s: any) => s.size === value);
    this.selectedSizePrice.set(sizeObj ? sizeObj.extraPrice : 0);
  }

  addToCart(): void {
    if (!this.meal) return;

    this.cartService.addItem({
      mealId: this.meal._id,
      name: this.meal.name,
      img: this.meal.img || this.meal.image || '',
      price: this.meal.price,
      quantity: this.quantity(),
      selectedSizePrice: this.selectedSizePrice(),
    });

    this.toastr.success(`${this.meal.name} added to cart!`, 'Cart', {
      timeOut: 2000,
      positionClass: 'toast-top-right',
    });
  }

  fetchRelatedItems(categorySlug: string, currentMealId: string): void {
    this.mealService.getMeals({ categorySlug, limit: 10 }).subscribe({
      next: (res: any) => {
        const items = res?.data || res?.data?.meals || [];

        const filtered = items.filter((item: any) => item._id !== currentMealId).slice(0, 3);

        this.relatedItems.set(filtered);
      },
      error: (err) => {
        console.error('Error fetching related items by slug:', err);
      },
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid product link');
        return;
      }

      this.isLoading.set(true);
      this.quantity.set(1);
      this.selectedSizePrice.set(0);

      this.mealService.getMealById(id).subscribe({
        next: (res) => {
          this.meal = res?.data || null;
          this.isLoading.set(false);

          const categorySlug =
            typeof this.meal?.category === 'object'
              ? this.meal?.category?.slug
              : this.meal?.categorySlug || this.meal?.category;

          if (categorySlug) {
            this.fetchRelatedItems(categorySlug, this.meal._id);
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Product not found');
          this.isLoading.set(false);
        },
      });
    });
  }
}

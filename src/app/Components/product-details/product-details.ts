import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
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

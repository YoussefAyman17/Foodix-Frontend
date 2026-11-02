import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, Subscription, catchError, switchMap, tap } from 'rxjs';
import { MealService } from '../../core/services/meal';
import { ReviewService } from '../../core/services/review';
import { CartService } from '../../core/services/cart';
import { ToastrService } from 'ngx-toastr';

const REVIEWS_PAGE_SIZE = 5;

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit, OnDestroy {
  meal = signal<any>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  quantity = signal<number>(1);
  selectedSize = signal<string>('Single');
  selectedSizePrice = signal<number>(0);

  relatedItems = signal<any[]>([]);
  relatedLoading = signal<boolean>(true);

  reviews = signal<any[]>([]);
  reviewsLoading = signal<boolean>(true);
  reviewsError = signal<boolean>(false);
  visibleCount = signal<number>(REVIEWS_PAGE_SIZE);

  readonly starScale = [1, 2, 3, 4, 5];
  readonly skeletonCards = [1, 2, 3];

  private routeSub?: Subscription;
  private relatedSub?: Subscription;
  private reviewsSub?: Subscription;

  visibleReviews = computed(() => this.reviews().slice(0, this.visibleCount()));

  averageRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return this.meal()?.ratingsAverage || 0;
    return list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length;
  });

  // How many reviews gave 5, 4, 3, 2 and 1 stars, with a percentage for the bars
  ratingBreakdown = computed(() => {
    const list = this.reviews();
    return [5, 4, 3, 2, 1].map((star) => {
      const count = list.filter((r) => Math.round(r.rating) === star).length;
      return { star, count, percent: list.length ? (count / list.length) * 100 : 0 };
    });
  });

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    private reviewService: ReviewService,
    private cartService: CartService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap
      .pipe(
        tap(() => this.resetState()),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.errorMessage.set('Invalid product link');
            this.isLoading.set(false);
            return EMPTY;
          }

          this.loadReviews(id); // runs in parallel with the meal request

          // switchMap drops the previous meal request if the user navigates again
          return this.mealService.getMealById(id).pipe(
            catchError((err) => {
              this.errorMessage.set(err.error?.message || 'Product not found');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
      )
      .subscribe((res: any) => {
        const meal = res?.data || null;
        this.meal.set(meal);
        this.isLoading.set(false);

        if (meal?.sizes?.length) {
          this.selectedSize.set(meal.sizes[0].size);
          this.selectedSizePrice.set(meal.sizes[0].extraPrice || 0);
        }

        const categorySlug =
          typeof meal?.category === 'object'
            ? meal?.category?.slug
            : meal?.categorySlug || meal?.category;

        if (categorySlug) this.fetchRelatedItems(categorySlug, meal._id);
        else this.relatedLoading.set(false);
      });
  }

  private resetState(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.meal.set(null);
    this.quantity.set(1);
    this.selectedSize.set('Single');
    this.selectedSizePrice.set(0);
    this.relatedItems.set([]);
    this.relatedLoading.set(true);
    this.reviews.set([]);
    this.reviewsLoading.set(true);
    this.reviewsError.set(false);
    this.visibleCount.set(REVIEWS_PAGE_SIZE);

    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0 });
  }

  // ---------------------------------------------------------------- reviews

  loadReviews(mealId: string): void {
    this.reviewsSub?.unsubscribe();
    this.reviewsLoading.set(true);
    this.reviewsError.set(false);

    this.reviewsSub = this.reviewService.getMealReviews(mealId).subscribe({
      next: (res: any) => {
        const list = res?.data?.reviews ?? res?.data ?? res ?? [];
        this.reviews.set(Array.isArray(list) ? list : []);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviewsError.set(true);
        this.reviewsLoading.set(false);
      },
    });
  }

  showMoreReviews(): void {
    this.visibleCount.update((n) => n + REVIEWS_PAGE_SIZE);
  }

  // ------------------------------------------------------------ meal actions

  increaseQty(): void {
    this.quantity.update((q) => q + 1);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  selectSize(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSize.set(value || 'Single');

    const sizeObj = this.meal()?.sizes?.find((s: any) => s.size === value);
    this.selectedSizePrice.set(sizeObj ? sizeObj.extraPrice || 0 : 0);
  }

  addToCart(): void {
    const meal = this.meal();
    if (!meal) return;

    this.cartService.addItem({
      mealId: meal._id,
      name: meal.name,
      img: meal.img || meal.image || '',
      price: meal.price,
      quantity: this.quantity(),
      selectedSize: this.selectedSize(),
      selectedSizePrice: this.selectedSizePrice(),
    });

    this.toastr.success(`${meal.name} added to cart!`, 'Cart', {
      timeOut: 2000,
      positionClass: 'toast-top-right',
    });
  }

  fetchRelatedItems(categorySlug: string, currentMealId: string): void {
    this.relatedSub?.unsubscribe();
    this.relatedLoading.set(true);

    this.relatedSub = this.mealService.getMeals({ categorySlug, limit: 10 }).subscribe({
      next: (res: any) => {
        const items = res?.data || res?.data?.meals || [];
        this.relatedItems.set(items.filter((i: any) => i._id !== currentMealId).slice(0, 3));
        this.relatedLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching related items by slug:', err);
        this.relatedLoading.set(false);
      },
    });
  }

  initialOf(review: any): string {
    return (review?.user?.userName || 'U').charAt(0).toUpperCase();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.relatedSub?.unsubscribe();
    this.reviewsSub?.unsubscribe();
  }
}

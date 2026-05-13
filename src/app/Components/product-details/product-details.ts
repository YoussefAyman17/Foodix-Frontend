import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MealService } from '../../core/services/meal';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  meal: any = null;
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

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

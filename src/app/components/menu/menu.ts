import { ChangeDetectorRef, Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CategoryService } from '../../core/services/category';
import { MealService } from '../../core/services/meal';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  isLoading = true;
  skeletons = [1, 2, 3, 4, 5, 6];
  private mealsSub?: Subscription;

  categories: any[] = [];
  meals: any[] = [];
  activeCategory: string = '';
  cdr = inject(ChangeDetectorRef);
  constructor(
    private categoryService: CategoryService,
    private mealService: MealService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data;

        if (this.categories.length > 0) {
          this.getProducts(this.categories[0].slug);
          this.activeCategory = this.categories[0].slug;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error(err),
    });
  }
  trackById = (_: number, meal: any) => meal._id;
  getProducts(slug: string): void {
    if (slug === this.activeCategory && !this.isLoading) return;

    this.activeCategory = slug;
    this.isLoading = true;
    this.meals = [];
    this.mealsSub?.unsubscribe();

    this.mealsSub = this.mealService.getMealsByCategory(slug).subscribe({
      next: (res: any) => {
        this.meals = res.data ?? res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.mealsSub?.unsubscribe();
  }
}

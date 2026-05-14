import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category';
import { MealService } from '../../core/services/meal';
import { catchError, forkJoin, of } from 'rxjs';
import { Inject, PLATFORM_ID } from '@angular/core';

import { Navbar } from '../navbar/navbar';
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  categories: any[] = [];
  topMeals: any[] = [];
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
        this.categories = Array.isArray(res?.data) ? res.data : [];
        this.cdr.detectChanges();
        if (!this.categories.length) {
          this.topMeals = [];
          return;
        }

        const mealRequests = this.categories.map((cat) =>
          this.mealService.getMealsByCategory(cat.slug).pipe(
            catchError((err) => {
              console.error(err);
              return of({ data: [] });
            }),
          ),
        );

        forkJoin(mealRequests).subscribe({
          next: (results: any[]) => {
            let allTopMeals: any[] = [];

            results.forEach((res, index) => {
              const catMeals = Array.isArray(res?.data) ? res.data : [];

              const top2 = [...catMeals]
                .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
                .slice(0, 2)
                .map((meal) => ({
                  ...meal,
                  categorySlug: this.categories[index].slug,
                }));

              allTopMeals.push(...top2);
            });

            this.topMeals = allTopMeals.sort(
              (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0),
            );
            this.cdr.detectChanges();
          },
          error: (err) => console.error(err),
        });
      },
      error: (err) => console.error(err),
    });
  }
}

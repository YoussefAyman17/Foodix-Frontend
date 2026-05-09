import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category';
import { MealService } from '../../core/services/meal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  categories: any[] = [];
  topMeals: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private mealService: MealService,
  ) {}

  ngOnInit() {

    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data;


        const mealRequests = this.categories.map((cat) =>
          this.mealService.getMealsByCategory(cat.slug),
        );

        forkJoin(mealRequests).subscribe({
          next: (results: any[]) => {
            let allTopMeals: any[] = [];

            results.forEach((res, index) => {
              const catMeals = res.data;

              const top2 = [...catMeals]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 2)
                .map((meal) => ({
                  ...meal,
                  categorySlug: this.categories[index].slug,
                }));

              allTopMeals.push(...top2);
            });

            this.topMeals = allTopMeals.sort((a, b) => b.rating - a.rating);
          },
          error: (err) => console.error(err),
        });
      },
      error: (err) => console.error(err),
    });
  }
}

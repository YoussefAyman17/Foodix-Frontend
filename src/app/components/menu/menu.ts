import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category';
import { MealService } from '../../core/services/meal';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  categories: any[] = [];
  meals: any[] = [];
  activeCategory: string = ''; // زي الـ active class القديم

  constructor(
    private categoryService: CategoryService,
    private mealService: MealService,
  ) {}

  ngOnInit() {
    // زي الـ fetch القديم بس من API
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data;

        // جيب أول كاتيجوري تلقائي زي ما كنت بتعمل قديم
        if (this.categories.length > 0) {
          this.getProducts(this.categories[0].slug);
          this.activeCategory = this.categories[0].slug;
        }
      },
      error: (err) => console.error(err),
    });
  }

  // زي الـ getProducts القديمة بتاعتك
  getProducts(slug: string) {
    this.activeCategory = slug; // زي ما كنت بتعمل active class
    this.mealService.getMealsByCategory(slug).subscribe({
      next: (res) => {
        this.meals = res.data;
      },
      error: (err) => console.error(err),
    });
  }
}

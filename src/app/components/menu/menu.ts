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
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        console.log(res);
        this.categories = res.data;

        if (this.categories.length > 0) {
          this.getProducts(this.categories[0].slug);
          this.activeCategory = this.categories[0].slug;
        }
      },
      error: (err) => console.error(err),
    });
  }

  getProducts(slug: string) {
    this.activeCategory = slug; 
    this.mealService.getMealsByCategory(slug).subscribe({
      next: (res) => {
        console.log(res);
        this.meals = res.data;
      },
      error: (err) => console.error(err),
    });
  }
}

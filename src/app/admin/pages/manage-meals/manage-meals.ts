import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealService } from '../../services/meal';
import { CategoryService } from '../../services/category';
import { Meal } from '../../interfaces/meal';
import { Category } from '../../interfaces/category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-meals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-meals.html',
  styleUrl: './manage-meals.css',
})
export class ManageMeals implements OnInit {
  private mealService = inject(MealService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);

  meals: Meal[] = [];
  categories: Category[] = [];
  isLoading: boolean = true;

  selectedCategoryIds: string[] = [];

  activeModal: 'add' | 'edit' | 'delete' | 'view' | null = null;
  selectedMeal: Meal | null = null;
  mealForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    this.loadMeals();
  }

  get filteredMeals(): Meal[] {
    if (this.selectedCategoryIds.length === 0) {
      return this.meals;
    }

    return this.meals.filter((meal) => {
      const mealCatId = typeof meal.category === 'object' ? meal.category?._id : meal.category;
      return this.selectedCategoryIds.includes(mealCatId as string);
    });
  }
  get totalMealsCount(): number {
    return this.meals.length;
  }

  get availableMealsCount(): number {
    return this.meals.filter((m) => m.isAvailable).length;
  }

  get outOfStockMealsCount(): number {
    return this.meals.filter((m) => !m.isAvailable).length;
  }

  get averageRating(): number {
    return 4.7;
  }

  onCategoryFilterChange(categoryId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedCategoryIds.push(categoryId);
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId);
    }
  }

  initForm() {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      img: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      old_price: [null],
      on_sale: [false],
      discount_tag: [null],
      short_description: ['', Validators.maxLength(150)],
      description: ['', Validators.maxLength(1000)],
      quantity: [0, [Validators.min(0)]],
      isAvailable: [true],
      sizes: this.fb.array([]),
    });
  }

  get sizesArray(): FormArray {
    return this.mealForm.get('sizes') as FormArray;
  }

  addSize() {
    this.sizesArray.push(
      this.fb.group({
        size: ['M', Validators.required],
        extraPrice: [0, Validators.min(0)],
      }),
    );
  }

  removeSize(index: number) {
    this.sizesArray.removeAt(index);
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data || res;
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  loadMeals() {
    this.isLoading = true;
    this.mealService.getAllMeals().subscribe({
      next: (response: any) => {
        this.meals = response.data || response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching meals:', err);
        this.toastr.error('Failed to load meals', 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openModal(modalType: 'add' | 'edit' | 'delete' | 'view', meal: Meal | null = null) {
    this.activeModal = modalType;
    this.selectedMeal = meal;
    this.sizesArray.clear();

    if (modalType === 'add') {
      this.mealForm.reset({
        price: 0,
        quantity: 0,
        isAvailable: true,
        on_sale: false,
      });
    } else if (modalType === 'edit' && meal) {
      if (meal.sizes && meal.sizes.length > 0) {
        meal.sizes.forEach((sizeObj) => {
          this.sizesArray.push(
            this.fb.group({
              size: [sizeObj.size, Validators.required],
              extraPrice: [sizeObj.extraPrice || 0],
            }),
          );
        });
      }

      this.mealForm.patchValue({
        name: meal.name,
        category: typeof meal.category === 'object' ? meal.category?._id : meal.category,
        price: meal.price,
        old_price: meal.old_price,
        on_sale: meal.on_sale,
        img: meal.img,
        discount_tag: meal.discount_tag,
        short_description: meal.short_description,
        description: meal.description,
        quantity: meal.quantity,
        isAvailable: meal.isAvailable,
      });
    }
  }

  closeModal() {
    this.activeModal = null;
    this.selectedMeal = null;
  }

  onSubmitMeal() {
    if (this.mealForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly');
      return;
    }

    const mealData: Meal = this.mealForm.value;

    if (this.activeModal === 'add') {
      this.mealService.addMeal(mealData).subscribe({
        next: () => {
          this.toastr.success('Meal added successfully');
          this.closeModal();
          this.loadMeals();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Error adding meal'),
      });
    } else if (this.activeModal === 'edit' && this.selectedMeal) {
      const updateId = this.selectedMeal.itemId;

      this.mealService.updateMeal(updateId as number, mealData).subscribe({
        next: () => {
          this.toastr.success('Meal updated successfully');
          this.closeModal();
          this.loadMeals();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Error updating meal'),
      });
    }
  }

  onSubmitDelete() {
    if (!this.selectedMeal?.itemId) return;
    this.mealService.deleteMeal(this.selectedMeal.itemId).subscribe({
      next: (res) => {
        this.toastr.success('Meal Deleted successfully!', 'Success');
        this.closeModal();
        this.loadMeals();
      },
      error: (err) => {
        console.error('Error Deleting Meal:', err);
        const errorMessage = err.error?.message || 'Failed to Delete meal.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }
}

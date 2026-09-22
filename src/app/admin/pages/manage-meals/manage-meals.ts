import { Component, OnInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { MealService } from '../../services/meal';
import { CategoryService } from '../../services/category';
import { Meal } from '../../interfaces/meal';
import { Category } from '../../interfaces/category';

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
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  meals = signal<Meal[]>([]);
  categories = signal<Category[]>([]);
  selectedCategoryIds = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  activeModal = signal<'add' | 'edit' | 'delete' | 'view' | null>(null);
  selectedMeal = signal<Meal | null>(null);

  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  mealForm!: FormGroup;
  isSubmitting = signal<boolean>(false);

  filteredMeals = computed(() => {
    const activeIds = this.selectedCategoryIds();
    const allMeals = this.meals();

    if (activeIds.length === 0) return allMeals;

    return allMeals.filter((meal) => {
      const mealCatId = typeof meal.category === 'object' ? meal.category?._id : meal.category;
      return activeIds.includes(mealCatId as string);
    });
  });

  totalMealsCount = computed(() => this.meals().length);
  availableMealsCount = computed(() => this.meals().filter((m) => m.isAvailable).length);
  outOfStockMealsCount = computed(() => this.meals().filter((m) => !m.isAvailable).length);

  averageRating = computed(() => {
    const currentMeals = this.meals();
    if (!currentMeals || currentMeals.length === 0) return 0;

    const ratedMeals = currentMeals.filter((m) => m.ratingsAverage != null && m.ratingsAverage > 0);
    if (ratedMeals.length === 0) return 0;

    const totalSum = ratedMeals.reduce((sum, meal) => sum + (meal.ratingsAverage || 0), 0);
    return Number((totalSum / ratedMeals.length).toFixed(1));
  });

  ngOnInit() {
    this.initForm();

    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    this.loadInitialData();
  }

  initForm() {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      old_price: [null],
      on_sale: [false],
      discount_tag: [null],
      short_description: ['', Validators.maxLength(150)],
      description: ['', Validators.maxLength(1000)],
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
        extraPrice: [0, [Validators.min(0)]],
      }),
    );
  }

  removeSize(index: number) {
    this.sizesArray.removeAt(index);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onCategoryFilterChange(categoryId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    this.selectedCategoryIds.update((ids) =>
      isChecked ? [...ids, categoryId] : ids.filter((id) => id !== categoryId),
    );
  }

  loadInitialData() {
    this.isLoading.set(true);

    forkJoin({
      categoriesRes: this.categoryService.getAllCategories(),
      mealsRes: this.mealService.getAllMeals(),
    }).subscribe({
      next: ({ categoriesRes, mealsRes }) => {
        this.categories.set(categoriesRes.data || categoriesRes);
        this.meals.set(mealsRes.data || mealsRes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching initial data:', err);
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.error('Failed to load dashboard data', 'Error');
        }
        this.isLoading.set(false);
      },
    });
  }

  loadMeals() {
    this.isLoading.set(true);
    this.mealService.getAllMeals().subscribe({
      next: (response: any) => {
        this.meals.set(response.data || response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching meals:', err);
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.error('Failed to load meals', 'Error');
        }
        this.isLoading.set(false);
      },
    });
  }

  openModal(modalType: 'add' | 'edit' | 'delete' | 'view', meal: Meal | null = null) {
    this.activeModal.set(modalType);
    this.selectedMeal.set(meal);
    this.sizesArray.clear();
    this.selectedFile.set(null);
    this.imagePreview.set(null);

    if (modalType === 'add') {
      this.mealForm.reset({
        price: 0,
        isAvailable: true,
        on_sale: false,
      });
    } else if (modalType === 'edit' && meal) {
      if (meal.sizes?.length) {
        meal.sizes.forEach((sizeObj) => {
          this.sizesArray.push(
            this.fb.group({
              size: [sizeObj.size, Validators.required],
              extraPrice: [sizeObj.extraPrice || 0],
            }),
          );
        });
      }

      this.imagePreview.set(meal.img || null);

      this.mealForm.patchValue({
        name: meal.name,
        category: typeof meal.category === 'object' ? meal.category?._id : meal.category,
        price: meal.price,
        old_price: meal.old_price,
        on_sale: meal.on_sale,
        discount_tag: meal.discount_tag,
        short_description: meal.short_description,
        description: meal.description,
        isAvailable: meal.isAvailable,
      });
    }
  }

  closeModal() {
    this.activeModal.set(null);
    this.selectedMeal.set(null);
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const formValues = this.mealForm.value;

    Object.keys(formValues).forEach((key) => {
      if (key === 'sizes') {
        formData.append('sizes', JSON.stringify(formValues.sizes));
      } else if (formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    });

    const file = this.selectedFile();
    if (file) {
      formData.append('img', file, file.name);
    }

    return formData;
  }

  onSubmitMeal() {
    if (this.isSubmitting()) {
      return;
    }
    if (this.mealForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);
    const currentModal = this.activeModal();

    if (currentModal === 'add' && !this.selectedFile()) {
      this.toastr.warning('Please select an image for the meal');
      return;
    }

    const formData = this.buildFormData();

    if (currentModal === 'add') {
      this.mealService.addMeal(formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toastr.success('Meal added successfully');
          this.closeModal();
          this.loadMeals();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error(err.error?.message);
          this.toastr.error(err.error?.message || 'Error adding meal');
        },
      });
    } else if (currentModal === 'edit') {
      const updateId = this.selectedMeal()?._id;
      if (!updateId) return;

      this.mealService.updateMeal(updateId, formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toastr.success('Meal updated successfully');
          this.closeModal();
          this.loadMeals();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.toastr.error(err.error?.message || 'Error updating meal');
        },
      });
    }
  }

  onSubmitDelete() {
    const mealId = this.selectedMeal()?._id;
    if (!mealId) return;

    this.mealService.deleteMeal(mealId).subscribe({
      next: () => {
        this.toastr.success('Meal deleted successfully!', 'Success');
        this.closeModal();
        this.loadMeals();
      },
      error: (err) => {
        console.error('Error deleting meal:', err);
        this.toastr.error(err.error?.message || 'Failed to delete meal.', 'Error');
      },
    });
  }
}

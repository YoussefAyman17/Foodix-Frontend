import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { Category } from '../../interfaces/category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-categories',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-categories.html',
  styleUrl: './manage-categories.css',
})
export class ManageCategories implements OnInit {
  private categoryService = inject(CategoryService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  totalCategories: number = 0;
  totalMenuItems: number = 0;
  averageItems: number = 0;

  activeModal: 'add' | 'edit' | 'delete' | null = null;
  selectedCategory: Category | null = null;

  isLoading: boolean = true;

  categoryForm!: FormGroup;

  ngOnInit() {
    this.loadCategories();
    this.initForm();
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      description: ['', [Validators.maxLength(200)]],
      icon: ['bi-heart-fill', Validators.required],
      color: ['bg-orange', Validators.required],
    });
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        this.categories = response.data || response;
        this.calculateStats();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  calculateStats() {
    this.totalCategories = this.categories.length;
    this.totalMenuItems = this.categories.reduce((sum, cat) => sum + (cat.itemsCount || 0), 0);
    this.averageItems =
      this.totalCategories > 0 ? Math.round(this.totalMenuItems / this.totalCategories) : 0;
  }

  openModal(modalType: 'add' | 'edit' | 'delete', category: Category | null = null) {
    this.activeModal = modalType;
    this.selectedCategory = category;

    if (modalType === 'add') {
      this.categoryForm.reset({ icon: 'bi-heart-fill', color: 'bg-orange' });
    }
    if (modalType === 'edit' && category) {
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description,
        icon: category.icon,
      });
    }
  }

  closeModal() {
    this.activeModal = null;
    this.selectedCategory = null;
  }

  onSubmitAdd() {
    if (this.categoryForm.invalid) return;

    const newCategory: Category = this.categoryForm.value;

    this.categoryService.addCategory(newCategory).subscribe({
      next: (res) => {
        console.log('Category added successfully', res);
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error adding category:', err);
        const errorMessage = err.error?.message || 'Something went wrong, please try again.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }
  onSubmitEdit() {
    if (this.categoryForm.invalid || !this.selectedCategory?.categoryId) return;

    const updatedData: Category = this.categoryForm.value;

    this.categoryService.updateCategory(this.selectedCategory.categoryId, updatedData).subscribe({
      next: (res) => {
        this.toastr.success('Category updated successfully!', 'Success');
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error updating category:', err);
        const errorMessage = err.error?.message || 'Failed to update category.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }

  onSubmitDelete() {
    if (!this.selectedCategory?.categoryId) return;
    this.categoryService.deleteCategory(this.selectedCategory.categoryId).subscribe({
      next: (res) => {
        this.toastr.success('Category Deleted successfully!', 'Success');
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error Deleting category:', err);
        const errorMessage = err.error?.message || 'Failed to Delete category.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }
}

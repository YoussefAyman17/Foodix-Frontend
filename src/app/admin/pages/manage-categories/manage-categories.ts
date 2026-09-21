import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);

  categories: Category[] = [];
  totalCategories: number = 0;
  totalMenuItems: number = 0;
  averageItems: number = 0;
  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0]; // Store the binary File object
    }
  }

  activeModal: 'add' | 'edit' | 'delete' | null = null;
  selectedCategory: Category | null = null;

  isLoading: boolean = true;

  categoryForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    this.loadCategories();
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      description: ['', [Validators.maxLength(200)]],
      image: ['', [Validators.required]],
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
    this.totalMenuItems = this.categories.reduce((sum, cat) => sum + (cat.mealsCount || 0), 0);
    this.averageItems =
      this.totalCategories > 0 ? Math.round(this.totalMenuItems / this.totalCategories) : 0;
  }

  openModal(modalType: 'add' | 'edit' | 'delete', category: Category | null = null) {
    this.activeModal = modalType;
    this.selectedCategory = category;

    if (modalType === 'add') {
      this.categoryForm.reset();
      this.categoryForm.get('image')?.setValidators([Validators.required]);
    }
    if (modalType === 'edit' && category) {
      this.categoryForm.get('image')?.clearValidators();
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description,
      });
    }
    this.categoryForm.get('image')?.updateValueAndValidity();
  }

  closeModal() {
    this.activeModal = null;
    this.selectedCategory = null;
    this.selectedFile = null;
  }

  onSubmitAdd() {
    if (this.categoryForm.invalid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('description', this.categoryForm.get('description')?.value);
    formData.append('image', this.selectedFile);

    this.categoryService.addCategory(formData).subscribe({
      next: (res) => {
        this.toastr.success('Category updated successfully!', 'Success');
        this.closeModal();
        this.loadCategories();
        this.selectedFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding category:', err);
        const errorMessage = err.error?.message || 'Something went wrong, please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.cdr.detectChanges();
      },
    });
  }
  onSubmitEdit() {
    if (this.categoryForm.invalid || !this.selectedCategory?._id) return;

    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('description', this.categoryForm.get('description')?.value || '');
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.categoryService.updateCategory(this.selectedCategory._id, formData).subscribe({
      next: (res) => {
        this.toastr.success('Category updated successfully!', 'Success');
        this.closeModal();
        this.loadCategories();
        this.selectedFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating category:', err);
        const errorMessage = err.error?.message || 'Failed to update category.';
        this.toastr.error(errorMessage, 'Error');
        this.cdr.detectChanges();
      },
    });
  }

  onSubmitDelete() {
    if (!this.selectedCategory?._id) return;
    this.categoryService.deleteCategory(this.selectedCategory._id).subscribe({
      next: (res) => {
        this.toastr.success('Category Deleted successfully!', 'Success');
        this.closeModal();
        this.loadCategories();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error Deleting category:', err);
        const errorMessage = err.error?.message || 'Failed to Delete category.';
        this.toastr.error(errorMessage, 'Error');
        this.cdr.detectChanges();
      },
    });
  }
}

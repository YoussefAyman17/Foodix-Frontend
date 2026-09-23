import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { WorkerService } from '../../services/worker';
import { of } from 'rxjs';

@Component({
  selector: 'app-manage-workers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-workers.html',
  styleUrls: ['./manage-workers.css'],
})
export class ManageWorkers implements OnInit {
  private workerService = inject(WorkerService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  workers: any[] = [];
  searchResults: any[] = [];
  selectedUser: any = null;

  userMode: 'existing' | 'new' = 'existing';
  isEditMode: boolean = false;
  editingWorkerId: string | null = null;

  workerForm!: FormGroup;
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.initForm();
    this.setupSearch();
    this.setupRoleValidation();
    this.fetchWorkers();
  }

  private initForm(): void {
    this.workerForm = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      role: ['Chef', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      shift: ['Morning', Validators.required],
      status: ['Active', Validators.required],
      vehicleType: [''],
      plateNumber: [''],
    });

    this.toggleUserValidators(false);
  }

  setUserMode(mode: 'existing' | 'new'): void {
    this.userMode = mode;
    this.clearSelectedUser();
    this.toggleUserValidators(mode === 'new');
  }

  private toggleUserValidators(isNew: boolean): void {
    const nameCtrl = this.workerForm.get('name');
    const emailCtrl = this.workerForm.get('email');

    if (isNew) {
      nameCtrl?.setValidators([Validators.required]);
      emailCtrl?.setValidators([Validators.required, Validators.email]);
    } else {
      nameCtrl?.clearValidators();
      emailCtrl?.clearValidators();
    }

    nameCtrl?.updateValueAndValidity();
    emailCtrl?.updateValueAndValidity();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const searchTerm = (query || '').trim();

          if (searchTerm.length < 2) {
            this.searchResults = [];
            this.cdr.markForCheck();
            return of({ data: [] });
          }

          return this.workerService.getAllUsers({ keyword: searchTerm }).pipe(
            catchError((err) => {
              console.error('User search failed:', err);
              return of({ data: [] });
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.searchResults = res?.data || res?.users || [];
          this.cdr.markForCheck();
        },
      });
  }

  selectExistingUser(user: any): void {
    this.selectedUser = user;
    this.searchResults = [];
    this.searchControl.setValue('', { emitEvent: false });
  }

  clearSelectedUser(): void {
    this.selectedUser = null;
  }

  private setupRoleValidation(): void {
    this.workerForm.get('role')?.valueChanges.subscribe((role) => {
      const vType = this.workerForm.get('vehicleType');
      const plate = this.workerForm.get('plateNumber');

      if (role === 'Delivery') {
        vType?.setValidators([Validators.required]);
        plate?.setValidators([Validators.required]);
      } else {
        vType?.clearValidators();
        plate?.clearValidators();
      }

      vType?.updateValueAndValidity();
      plate?.updateValueAndValidity();
    });
  }

  fetchWorkers(): void {
    this.workerService.getAllWorkers().subscribe({
      next: (res) => {
        const fetchedWorkers = res?.data || res?.workers || [];
        // Asynchronous microtask prevents ExpressionChangedAfterItHasBeenCheckedError (NG0100)
        queueMicrotask(() => {
          this.workers = fetchedWorkers;
          this.cdr.markForCheck();
        });
      },
      error: () => this.toastr.error('Failed to load workers'),
    });
  }

  submitWorker(): void {
    if (this.workerForm.invalid) {
      this.toastr.error('Please complete all required fields');
      return;
    }

    const val = this.workerForm.value;

    if (this.isEditMode && this.editingWorkerId) {
      const updatePayload: any = {
        role: val.role,
        salary: val.salary,
        shift: val.shift,
        status: val.status,
      };

      if (val.role === 'Delivery') {
        updatePayload.deliveryDetails = {
          vehicleType: val.vehicleType,
          plateNumber: val.plateNumber,
        };
      }

      this.workerService.updateWorker(this.editingWorkerId, updatePayload).subscribe({
        next: () => {
          this.toastr.success('Worker updated successfully');
          this.fetchWorkers();
          this.cancelEdit();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Update failed'),
      });
    } else {
      const payload: any = {
        role: val.role,
        salary: val.salary,
        shift: val.shift,
        status: val.status,
      };

      if (this.userMode === 'existing') {
        if (!this.selectedUser) {
          this.toastr.error('Please select an existing user account');
          return;
        }
        payload.userId = this.selectedUser._id;
      } else {
        payload.userData = {
          userName: val.name,
          email: val.email,
          phone: val.phone || undefined,
        };
      }

      if (val.role === 'Delivery') {
        payload.deliveryDetails = {
          vehicleType: val.vehicleType,
          plateNumber: val.plateNumber,
        };
      }

      this.workerService.addWorker(payload).subscribe({
        next: () => {
          this.toastr.success('Worker added successfully');
          this.fetchWorkers();
          this.cancelEdit();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Creation failed'),
      });
    }
  }

  editWorker(worker: any): void {
    this.isEditMode = true;
    this.editingWorkerId = worker._id;

    this.workerForm.patchValue({
      name: worker.userId?.userName || '',
      email: worker.userId?.email || '',
      phone: worker.userId?.phone || '',
      role: worker.role,
      salary: worker.salary,
      shift: worker.shift,
      status: worker.status,
      vehicleType: worker.deliveryDetails?.vehicleType || '',
      plateNumber: worker.deliveryDetails?.plateNumber || '',
    });
  }

  deleteWorker(workerId: string): void {
    if (!confirm('Are you sure you want to remove this worker record?')) return;

    this.workerService.deleteWorker(workerId).subscribe({
      next: () => {
        this.toastr.success('Worker deleted successfully');
        this.fetchWorkers();
      },
      error: () => this.toastr.error('Failed to delete worker'),
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingWorkerId = null;
    this.clearSelectedUser();
    this.workerForm.reset({
      name: '',
      email: '',
      phone: '',
      role: 'Chef',
      salary: 0,
      shift: 'Morning',
      status: 'Active',
      vehicleType: '',
      plateNumber: '',
    });
    this.setUserMode('existing');
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkerService } from '../../services/worker.services';
import { Worker } from '../../interfaces/worker';

@Component({
  selector: 'app-manage-worker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-workers.html',
  styleUrls: ['./manage-workers.css']
})
export class ManageWorkers implements OnInit {
  private platformId = inject(PLATFORM_ID);

  workers: Worker[] = [];

  workerForm!: FormGroup;

  selectedWorkerId: string = '';

  isEditMode: boolean = false;

  constructor(
    private workerService: WorkerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.workerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      salary: ['', Validators.required],
      shift: ['Morning'],
      status: ['Active'],
      vehicleType: ['Motorcycle'],
      plateNumber: ['']
    });

    if (isPlatformBrowser(this.platformId)) {
      this.getWorkers();
    }
  }

  getWorkers() {
    this.workerService.getAllWorkers().subscribe({
      next: (res) => {
        this.workers = res.workers || res.Workers || [];
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  submitWorker() {
    if (this.workerForm.invalid) {
      this.workerForm.markAllAsTouched();
      return;
    }

    const formData = {
      userId: {
        userName: this.workerForm.value.name,
        email: this.workerForm.value.email,
        phone: this.workerForm.value.phone
      },

      role: 'Delivery',

      salary: Number(this.workerForm.value.salary),

      shift: this.workerForm.value.shift,

      status: this.workerForm.value.status,

      deliveryDetails: {
        vehicleType: this.workerForm.value.vehicleType,
        plateNumber: this.workerForm.value.plateNumber,
        isOnline: false
      }
    };

    if (this.isEditMode) {

      this.workerService.updateWorker(
        this.selectedWorkerId,
        formData
      ).subscribe({
        next: () => {
          this.resetForm();
          this.getWorkers();
        },
        error: (err) => {
          console.log(err);
        }
      });

    } else {

      this.workerService.addWorker(formData).subscribe({
        next: () => {
          this.resetForm();
          this.getWorkers();
        },
        error: (err) => {
          console.log(err);
        }
      });

    }
  }

  editWorker(worker: any) {

    this.isEditMode = true;

    this.selectedWorkerId = worker._id;

    this.workerForm.patchValue({
      name: worker.userId?.userName,
      email: worker.userId?.email,
      phone: worker.userId?.phone,
      salary: worker.salary,
      shift: worker.shift,
      status: worker.status,
      vehicleType: worker.deliveryDetails?.vehicleType,
      plateNumber: worker.deliveryDetails?.plateNumber
    });
  }

  deleteWorker(id: string) {

    this.workerService.deleteWorker(id).subscribe({
      next: () => {
        this.getWorkers();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  resetForm() {

    this.workerForm.reset({
      shift: 'Morning',
      status: 'Active',
      vehicleType: 'Motorcycle'
    });

    this.isEditMode = false;

    this.selectedWorkerId = '';
  }
}

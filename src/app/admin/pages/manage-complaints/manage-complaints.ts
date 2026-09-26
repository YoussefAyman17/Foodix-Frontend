import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Complaints } from '../../interfaces/complaints';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';
import { ComplaintsService } from '../../services/complaints-service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-complaints',
  imports: [CommonModule, TimeagoModule, FormsModule],
  templateUrl: './manage-complaints.html',
  styleUrl: './manage-complaints.css',
})
export class ManageComplaints implements OnInit {
  complaints: Complaints[] = [];

  selectedComplaint: Complaints | null = null;

  activeModal: string = '';
  responseText: string = '';
  isLoading: boolean = false;
  cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private toastr = inject(ToastrService);
  stats = {
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  };
  constructor(private complaintsService: ComplaintsService) {}
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.fetchComplaints();
  }

  fetchComplaints(): void {
    this.isLoading = true;
    this.complaintsService.getComplaints().subscribe({
      next: (res) => {
        // console.log(res);
        this.complaints = res.data || [];
        this.calculateStats();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load complaints');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  calculateStats(): void {
    this.stats = {
      totalComplaints: this.complaints.length,
      pendingComplaints: this.complaints.filter((c) => c.status === 'pending').length,
      inProgressComplaints: this.complaints.filter((c) => c.status === 'in process').length,
      resolvedComplaints: this.complaints.filter((c) => c.status === 'resolved').length,
    };
  }

  updateStatus(id: string, newStatus: string, adminResponse?: string): void {
    this.complaintsService.changeStatus(id, newStatus, adminResponse).subscribe({
      next: () => {
        this.toastr.success('Complaint status updated successfully');
        const index = this.complaints.findIndex((c) => c._id === id);
        if (index !== -1) {
          this.complaints[index].status = newStatus as any;
          if (adminResponse) this.complaints[index].adminResponse = adminResponse;
          this.calculateStats();
          this.cdr.detectChanges();
        }
      },
      error: (err) => this.toastr.error('Failed to update complaint'),
    });
  }

  openModal(type: string, complaint?: Complaints): void {
    this.activeModal = type;

    if (complaint) {
      this.selectedComplaint = complaint;
    }
  }

  closeModal(): void {
    this.activeModal = '';

    this.selectedComplaint = null;
  }

  openResponseModal(complaint: Complaints): void {
    this.selectedComplaint = complaint;

    this.activeModal = 'response';
  }

  submitResponse(): void {
    if (!this.selectedComplaint || !this.responseText.trim()) return;

    const complaintId = this.selectedComplaint._id;

    this.updateStatus(complaintId!, 'in process', this.responseText);

    this.responseText = '';

    this.closeModal();
  }
  rejectComplaint(): void {
    if (!this.selectedComplaint) return;

    const complaintId = this.selectedComplaint._id;

    this.updateStatus(complaintId!, 'rejected');

    this.closeModal();
  }
}

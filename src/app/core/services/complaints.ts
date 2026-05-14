import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Complaints } from '../../admin/interfaces/complaints';

@Injectable({
  providedIn: 'root',
})
export class ComplaintsService {
  constructor(private httpClient: HttpClient) {}

  createComplaint(data: {
    name: string;
    email: string;
    subject: string;
    service: string;
    message: string;
  }): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiURL}/complaints`, data);
  }

  getComplaints(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiURL}/complaints`);
  }

  changeStatus(id: number, status: string, adminResponse?: string): Observable<any> {
    return this.httpClient.patch(`${environment.apiURL}/complaints/${id}/status`, {
      status,
      adminResponse,
    });
  }
}
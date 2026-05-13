import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Complaints } from '../interfaces/complaints';

@Injectable({
  providedIn: 'root',
})
export class ComplaintsService {
  constructor(private httpClient: HttpClient) {}

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

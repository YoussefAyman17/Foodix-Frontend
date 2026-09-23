import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Worker } from '../interfaces/worker';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiURL}workers`;
  private userBaseUrl = `${environment.baseURL}`;

  getAllUsers(query: any): Observable<any> {
    const users = this.http.get(this.userBaseUrl, { params: query });
    console.log(users, query);
    return users;
  }
  getAllWorkers(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  addWorker(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateWorker(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, data);
  }

  deleteWorker(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getOnlineDeliveryWorkers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/delivery`);
  }

  assignDeliveryToOrder(orderId: string, deliveryPersonId: string) {
    return this.http.patch(`${environment.apiURL}/orders/${orderId}/assign`, {
      deliveryPersonId,
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // 🌟 تأكد من مسار الـ environment بتاعك
import { Auth } from '../../core/services/auth';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private apiUrl = `${environment.apiURL}/orders`;

  getAllOrders(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateOrderStatus(id: number, newStatus: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { newStatus });
  }

  assignDeliveryPerson(id: number, deliveryPersonId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/assign`, { deliveryPersonId });
  }

  getUserOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/myorders`);
  }

  checkout(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  trackOrder(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAllDeliveryPersons() {
    // return this.http.get(`${environment.apiURL}/workers/delivery`);
    return this.http.get(`http://localhost:3000/api/workers/delivery`);
  }

  getDeliveryOrders(): Observable<any> {
    const deliveryId = this.auth.decodedUserData()?.workerId;
    if (!deliveryId) return this.http.get(`${this.apiUrl}/delivery-orders`);
    return this.http.get(`${this.apiUrl}/delivery-orders?workerId=${deliveryId}`);
  }
}

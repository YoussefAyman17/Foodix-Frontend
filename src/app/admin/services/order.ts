import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // 🌟 تأكد من مسار الـ environment بتاعك

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  private apiUrl = `http://localhost:3000/api/orders`;

  getAllOrders(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateOrderStatus(id: number, newStatus: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { newStatus });
  }

  assignDeliveryPerson(id: number, deliveryPersonId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/assign`, { deliveryPerson: deliveryPersonId });
  }

  getUserOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/myorders`);
  }

  checkout(orderData: any): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  trackOrder(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getAllDeliveryPersons() {
    return this.http.get(`http://localhost:3000/api/users/delivery`);
  }
}

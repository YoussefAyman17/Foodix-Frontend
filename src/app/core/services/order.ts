import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = `${environment.apiURL}orders/`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  private getHeaders() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('userToken') || '' : '';
    return { headers: { authorization: token } };
  }

  // GET /api/orders/myorders
  getMyOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}myorders`);
  }

  // GET /api/orders/:id
  trackOrder(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${id}`);
  }

  cancelUnpaidOrder(orderCode: number | string) {
    return this.http.post(`${this.baseUrl}${orderCode}/cancel-unpaid`, {});
  }
}

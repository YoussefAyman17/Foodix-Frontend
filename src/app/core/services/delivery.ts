import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiURL}workers/delivery`;

  updateStatus(isOnline: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/status`, { isOnline });
  }
}

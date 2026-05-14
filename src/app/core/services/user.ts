import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.baseURL}`;
  // environment.baseURL = 'http://localhost:3000/api/users/'

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  private getHeaders() {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('userToken') || '' : '';
    return { headers: { authorization: token } };
  }

  // GET /api/users/me
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}me`, this.getHeaders());
  }

  // PATCH /api/users/updateMe
  updateMyProfile(data: object): Observable<any> {
    return this.http.patch(`${this.baseUrl}updateMe`, data, this.getHeaders());
  }

  // PATCH /api/users/updatePassword
  updatePassword(data: object): Observable<any> {
    return this.http.patch(`${this.baseUrl}updatePassword`, data, this.getHeaders());
  }
}

import { HttpClient } from '@angular/common/http';
import { computed, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  decodedUserData = signal<any>(null);
  isAdmin = computed(() => {
    const user = this.decodedUserData();
    return user?.role === 'Admin';
  });
  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  registerApi(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseURL}signUp`, data);
  }

  loginApi(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseURL}login`, data);
  }

  forgotPassApi(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseURL}forgetPassword`, data);
  }

  verifyApi(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseURL}verifyResetCode`, data);
  }

  resetPassApi(data: object): Observable<any> {
    return this.httpClient.put(`${environment.baseURL}resetPassword`, data);
  }

  loginWithGoogleApi(data: { idToken: string }): Observable<any> {
    return this.httpClient.post(`${environment.baseURL}google`, data);
  }

  private getToken(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return localStorage.getItem('userToken') || '';
  }

  private getHeaders() {
    const token = this.getToken();

<<<<<<< HEAD
    return { headers: { authorization: token ? `${token}` : '' } };
=======
    return { headers: { authorization: token ? `${token}` : '' }};
    // return { headers: { authorization: token ? token : '' } };

>>>>>>> 41c3cc56f0e7245c070d472cd6782bd148f13963
  }

  userData() {
    let token = this.getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      this.decodedUserData.set(decoded);
    } catch (error) {
      console.error('Invalid token format', error);
      this.decodedUserData.set(null);
    }
  }

  // ================= Omar's Endpoints =================

  getMyProfileApi(): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}me`, this.getHeaders());
  }

  updateMyProfileApi(data: object): Observable<any> {
    return this.httpClient.patch(`${environment.baseURL}updateMe`, data, this.getHeaders());
  }

  getMyOrdersApi(): Observable<any> {
return this.httpClient.get(`${environment.apiURL}/orders/myorders`, this.getHeaders());
  }
}

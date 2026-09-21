import { HttpClient } from '@angular/common/http';
import { computed, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  workerId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  decodedUserData = signal<UserPayload | null>(this.getUserFromToken());

  isAdmin = computed(() => {
    const user = this.decodedUserData();
    return user?.role === 'Admin';
  });

  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.initAuthState();
  }

  private initAuthState(): void {
    const user = this.getUserFromToken();
    if (user) {
      this.decodedUserData.set(user);
    }
  }
  // ================= Auth Core Operations =================

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userToken', token);
      this.decodedUserData.set(this.getUserFromToken());
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userToken');
      this.decodedUserData.set(null);
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('userToken');
  }

  private getUserFromToken(): UserPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      console.error('Invalid token format:', error);
      return null;
    }
  }

  // ================= Auth Endpoints =================

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

  // ================= Profile & User Endpoints =================

  getMyProfileApi(): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}me`).pipe(
      tap((res: any) => {
        // If backend sends updated user data, keep signal synced
        if (res.data) {
          this.decodedUserData.set({
            id: res.data._id || res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
          });
        }
      }),
    );
  }

  updateMyProfileApi(data: object): Observable<any> {
    return this.httpClient.patch(`${environment.baseURL}updateMe`, data).pipe(
      tap((res: any) => {
        if (res.data) {
          this.decodedUserData.set({
            id: res.data._id || res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
          });
        }
      }),
    );
  }

  getMyOrdersApi(): Observable<any> {
    return this.httpClient.get(`${environment.apiURL}/orders/myorders`);
  }
}

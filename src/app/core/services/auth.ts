import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  decodedUserData: any;
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
    return { headers: { authorization: this.getToken() } };
  }

  userData() {
    let token = this.getToken();
    if (!token) return;
    this.decodedUserData = jwtDecode(token!);
  }

  //omar

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

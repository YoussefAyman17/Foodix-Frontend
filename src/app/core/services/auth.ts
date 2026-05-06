import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  decodedUserData: any;
  constructor(private httpClient: HttpClient) {}

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
  userData() {
    let token = localStorage.getItem('userToken');
    if (!token) return;
    this.decodedUserData = jwtDecode(token!);
    console.log(this.decodedUserData);
  }
}

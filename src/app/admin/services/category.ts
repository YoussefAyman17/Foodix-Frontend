import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiURL}categories`;

  getAllCategories(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(this.apiUrl);
  }

  addCategory(formData: FormData): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(this.apiUrl, formData);
  }

  updateCategory(id: string, categoryData: any): Observable<any> {
    return this.http.patch<{ data: Category }>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

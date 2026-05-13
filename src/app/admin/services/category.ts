import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/categories';

  getAllCategories(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(this.apiUrl);
  }

  addCategory(categoryData: Category): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(this.apiUrl, categoryData);
  }

  updateCategory(id: number, categoryData: any): Observable<any> {
    return this.http.patch<{ data: Category }>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

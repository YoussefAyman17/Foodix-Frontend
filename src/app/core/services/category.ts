import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  // GET /api/categories
  getAllCategories(): Observable<any> {
    return this.http.get(this.baseUrl);
  }


  // GET /api/categories/:id
  getCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // POST /api/categories
  createCategory(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }


  // PATCH /api/categories/:id
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, data);
  }


 // DELETE /api/categories/:id
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  

}

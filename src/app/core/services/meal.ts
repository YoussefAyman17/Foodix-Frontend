import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private baseUrl = `${environment.apiURL}categories`;
  private baseUrl2 = `${environment.apiURL}meals`;
  constructor(private http: HttpClient) {}

  getMeals(params?: { categorySlug?: string; limit?: number; page?: number }): Observable<any> {
    let queryParams: any = {};
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.page) queryParams.page = params.page;

    return this.http.get(`${this.baseUrl}/${params?.categorySlug}/meals`, { params: queryParams });
  }
  // GET /api/categories/:slug/meals
  getMealsByCategory(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${slug}/meals`);
  }

  // GET /api/meals/:id
  getMealById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl2}/${id}`);
  }

  // POST /api/categories/:slug/meals
  createMeal(slug: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${slug}/meals`, data);
  }

  // PATCH /api/categories/:slug/meals/:id
  updateMeal(slug: string, id: number, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${slug}/meals/${id}`, data);
  }

  // DELETE /api/categories/:slug/meals/:id
  deleteMeal(slug: string, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${slug}/meals/${id}`);
  }
}

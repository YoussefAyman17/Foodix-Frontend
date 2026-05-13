import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private baseUrl = `${environment.apiURL}/categories`;
  constructor(private http: HttpClient) {}

  // GET /api/categories/:slug/meals
  getMealsByCategory(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${slug}/meals`);
  }

  // GET /api/categories/:slug/meals/:id
  getMealById(slug: string, id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${slug}/meals/${id}`);
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

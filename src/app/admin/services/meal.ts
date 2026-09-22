import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meal } from '../interfaces/meal';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiURL}meals`;

  getAllMeals(): Observable<{ data: Meal[] }> {
    return this.http.get<{ data: Meal[] }>(this.apiUrl);
  }

  addMeal(mealData: FormData | Meal): Observable<any> {
    return this.http.post(this.apiUrl, mealData);
  }

  updateMeal(id: string, mealData: FormData | Meal): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, mealData);
  }

  deleteMeal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

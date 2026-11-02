import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);

  getMealReviews(mealId: string) {
    return this.http.get<any>(`${environment.apiURL}meals/${mealId}/reviews`);
  }
}
export class Review {}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlannedMeal, PlanningMonthResponse } from '../models/planning';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl ? `${environment.apiUrl}/api/orders/planning` : '/api/orders/planning';

  /**
   * GET /api/orders/planning/?annee=YYYY&mois=MM&date=YYYY-MM-DD
   */
  getPlanning(year: number, month: number, selectedDate?: string): Observable<PlanningMonthResponse> {
    let params = new HttpParams()
      .set('annee', year.toString())
      .set('mois', month.toString());

    if (selectedDate) {
      params = params.set('date', selectedDate);
    }

    return this.http.get<PlanningMonthResponse>(`${this.apiUrl}/`, { params }).pipe(
      catchError(err => {
        console.error('Erreur API Planning:', err);
        return of({
          annee: year,
          mois: month,
          selected_date: selectedDate || null,
          total_repas_mois: 0,
          dates_avec_repas: [],
          repas: []
        });
      })
    );
  }

  /**
   * GET /api/orders/planning/{id}/
   */
  getPlannedMealById(id: number): Observable<PlannedMeal | null> {
    return this.http.get<PlannedMeal>(`${this.apiUrl}/${id}/`).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * POST /api/orders/planning/
   */
  createPlannedMeal(data: Partial<PlannedMeal>): Observable<PlannedMeal> {
    return this.http.post<PlannedMeal>(`${this.apiUrl}/`, data);
  }

  /**
   * PATCH /api/orders/planning/{id}/
   */
  updatePlannedMeal(id: number, data: Partial<PlannedMeal>): Observable<PlannedMeal> {
    return this.http.patch<PlannedMeal>(`${this.apiUrl}/${id}/`, data);
  }

  /**
   * DELETE /api/orders/planning/{id}/
   */
  cancelPlannedMeal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}

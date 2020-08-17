import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiEndpointService } from './api-endpoint.service';
import { PriorIncome } from '../interfaces/prior-income';


@Injectable({
  providedIn: 'root'
})
export class PriorIncomeService extends ApiEndpointService {

  constructor(protected http: HttpClient) {
      super(http, 'prior-income');
  }

  getPriorIncomes(): Observable<PriorIncome[]> {
      return this.http.get<PriorIncome[]>(this.apiUrl);
  }

  addPriorIncome(priorIncome: PriorIncome): Observable<PriorIncome> {
      return this.http.post<PriorIncome>(this.apiUrl, priorIncome, this.httpOptions).pipe(
          tap((newPriorIncome: PriorIncome) => console.log(`added prior income with id=${newPriorIncome.id}`)),
          catchError(this.handleError<PriorIncome>('addPriorIncome'))
      );
  }

  updatePriorIncome(priorIncome: PriorIncome): Observable<PriorIncome> {
      return this.http.put<PriorIncome>(this.apiUrl, priorIncome, this.httpOptions).pipe(
          tap((newPriorIncome: PriorIncome) => console.log(`updated prior income with id=${newPriorIncome.id}`)),
          catchError(this.handleError<PriorIncome>('updatePriorIncome'))
      );
  }

  deletePriorIncome(priorIncome: PriorIncome): Observable<PriorIncome> {
    var options = this.httpOptions;
    options.params = new HttpParams().set('id', priorIncome.id.toString());
    return this.http.delete<PriorIncome>(this.apiUrl, this.httpOptions).pipe(
      tap((removedPriorIncome: PriorIncome) => console.log(`removed prior income with id=${removedPriorIncome.id}`)),
      catchError(this.handleError<PriorIncome>('deletePriorIncome'))
    );
  }
}

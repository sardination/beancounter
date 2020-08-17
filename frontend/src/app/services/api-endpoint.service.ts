import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// endpoint interfaces
import { PriorIncome } from '../interfaces/prior-income';
import { Transaction } from '../interfaces/transaction';


@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {

  private apiUrl = 'http://127.0.0.1:5000/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    params: new HttpParams()
  };

  constructor(private http: HttpClient) { }

  private createEndpointUrl(endpoint): string {
      return `${this.apiUrl}${endpoint}`;
  }

  // retrieval functions
  getPriorIncomes(): Observable<PriorIncome[]> {
      var endpointUrl = this.createEndpointUrl('prior-income');
      return this.http.get<PriorIncome[]>(endpointUrl);
  }

  addPriorIncome(priorIncome: PriorIncome): Observable<PriorIncome> {
      var endpointUrl = this.createEndpointUrl('prior-income');
      return this.http.post<PriorIncome>(endpointUrl, priorIncome, this.httpOptions).pipe(
          tap((newPriorIncome: PriorIncome) => console.log(`added prior income with id=${newPriorIncome.id}`)),
          catchError(this.handleError<PriorIncome>('addPriorIncome'))
      );
  }

  updatePriorIncome(priorIncome: PriorIncome): Observable<PriorIncome> {
    var endpointUrl = this.createEndpointUrl('prior-income');
      return this.http.put<PriorIncome>(endpointUrl, priorIncome, this.httpOptions).pipe(
          tap((newPriorIncome: PriorIncome) => console.log(`updated prior income with id=${newPriorIncome.id}`)),
          catchError(this.handleError<PriorIncome>('updatePriorIncome'))
      );
  }

  deletePriorIncome(priorIncome: PriorIncome): Observable<PriorIncome> {
    var endpointUrl = this.createEndpointUrl('prior-income');
    var options = this.httpOptions;
    options.params = new HttpParams().set('id', priorIncome.id.toString());
    return this.http.delete<PriorIncome>(endpointUrl, this.httpOptions).pipe(
      tap((removedPriorIncome: PriorIncome) => console.log(`removed prior income with id=${removedPriorIncome.id}`)),
      catchError(this.handleError<PriorIncome>('deletePriorIncome'))
    );
  }

  getInfo(title: string): any {
      var endpointUrl = this.createEndpointUrl(`info/${title}`);
      return this.http.get(endpointUrl);
  }

  updateInfo(title: string, value: any): any {
      title = title.trim();
      var endpointUrl = this.createEndpointUrl(`info/${title}`);
      return this.http.post(endpointUrl, {"value": value}, this.httpOptions).pipe(
          tap((newInfo: any) => console.log(`updated ${newInfo.title} with value ${newInfo.value}`)),
          catchError(this.handleError('updateValue'))
      );
  }

  getTransactions(): Observable<Transaction[]> {
      var endpointUrl = this.createEndpointUrl('transactions')
      return this.http.get<Transaction[]>(endpointUrl);
  }


  // error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {

  protected apiUrl = 'http://127.0.0.1:5000';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    params: new HttpParams()
  };

  constructor(protected http: HttpClient, apiExtension: string) {
    this.apiUrl = `${this.apiUrl}/${apiExtension}`;
  }

  createEndpoint(endpoint: string) {
    return `${this.apiUrl}/${endpoint}`;
  }

  // error handling
  protected handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // allow processing of a returned item by not using undefined
      if (result == undefined) {
          result = {} as T;
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}

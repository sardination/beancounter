import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { Observable, of, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {

  protected apiUrl = 'http://financeapp';

  constructor(protected http: HttpClient, apiExtension: string) {
    if (isDevMode()) {
      this.apiUrl = 'http://127.0.0.1:5000';
    }

    this.apiUrl = `${this.apiUrl}/${apiExtension}`;
  }

  createEndpoint(endpoint: string) {
    return `${this.apiUrl}/${endpoint}`;
  }

  sendRequest<T>(method: string, path: string, params?: any, body?: any): Observable<T> {
    params = params || {};
    var httpOptions = {
      // headers: new HttpHeaders({
      //   'Content-Type': 'application/json'
      // }),
      headers: {'Content-Type': 'application/json'},
      params: params,
      body: body,
    };

    if (isDevMode()) {
      return this.http.request<T>(method, path, httpOptions);
    } else if (window.pywebview) {
      return from(
        window.pywebview.api.request(method, path, httpOptions) as PromiseLike<T>
      );
    }

    return of<T>();

    // if (isDevMode()) {
    //   return this.http.request<T>(method, path, httpOptions);
    // } else {
    //   return pywebview.api.request(method, path, httpOptions);
    // }
  }

  sendGetRequest<T>(path: string, params?: any, body?: any): Observable<T> {
    return this.sendRequest<T>("GET", path, params, body);
  }

  sendPostRequest<T>(path: string, params?: any, body?: any): Observable<T> {
    return this.sendRequest<T>("POST", path, params, body);
  }

  sendPutRequest<T>(path: string, params?: any, body?: any): Observable<T> {
    return this.sendRequest<T>("PUT", path, params, body);
  }

  sendDeleteRequest<T>(path: string, params?: any, body?: any): Observable<T> {
    return this.sendRequest<T>("DELETE", path, params, body);
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

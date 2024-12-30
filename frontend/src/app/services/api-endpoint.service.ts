import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { Observable, of, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {

  protected apiUrl = 'undefined';

  constructor(protected http: HttpClient, apiExtension: string) {
    this.apiUrl = `${environment.apiUrl}/${apiExtension}`;
  }

  createEndpoint(endpoint: string) {
    return `${this.apiUrl}/${endpoint}`;
  }

  sendRequest<T>(method: string, path: string, params?: any, body?: any): Observable<T> {
    params = params || {};
    var httpOptions = {
      headers: {'Content-Type': 'application/json'},
      params: params,
      body: body,
    };
    if (body && body.date) {
      // Need to pass in zulu string
      body.date = body.date.toISOString()
    }
    // We're not supporting web app mode right now, so it will always be using webview
    // if (!environment.useWebview) {
    //   return this.http.request<T>(method, path, httpOptions);
    // } else if (window.pywebview) {
    if (window.pywebview) {
      return from(
        window.pywebview.api.request(method, path, httpOptions) as PromiseLike<T>
      );
    }

    return of<T>();
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

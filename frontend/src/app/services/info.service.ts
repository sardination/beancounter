import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiEndpointService } from './api-endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class InfoService extends ApiEndpointService {

  constructor(protected http: HttpClient) {
      super(http, 'info');
  }

  getInfo(title: string): any {
      return this.http.get(this.createEndpoint(title));
  }

  updateInfo(title: string, value: any): any {
      title = title.trim();
      return this.http.post(this.createEndpoint(title), {"value": value}, this.httpOptions).pipe(
          tap((newInfo: any) => console.log(`updated ${newInfo.title} with value ${newInfo.value}`)),
          catchError(this.handleError('updateValue'))
      );
  }
}

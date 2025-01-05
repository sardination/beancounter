import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { ApiEndpointService } from './api-endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class InfoService extends ApiEndpointService {

  constructor(protected http: HttpClient) {
      super(http, 'info');
  }

  convertStringToDate(dateString: string): Date {
    let dateParts = dateString.split('-'); // YYYY-MM-DD
    return new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2])); // months are 0-indexed
  }

  getInfo(title: string): Observable<any> {
      return this.sendRequest("GET", this.createEndpoint(title)).pipe(
          map(newObject => {
            if (newObject["title"] == "start_date") {
              newObject["value"] = this.convertStringToDate(newObject["value"]);
            }
            return newObject;
          }),
          catchError(this.handleError('getInfo'))
      );
  }

  updateInfo(title: string, value: any): Observable<any> {
      title = title.trim();
      if (title == "start_date") {
        value = (value as Date).toISOString()
      }
      return this.sendRequest("POST", this.createEndpoint(title), undefined, {"title": title, "value": value}).pipe(
          map(newObject => {
            if (newObject["title"] == "start_date") {
              newObject["value"] = this.convertStringToDate(newObject["value"]);
            }
            return newObject;
          }),
          tap((newInfo: any) => console.log(`updated ${newInfo.title} with value ${newInfo.value}`)),
          catchError(this.handleError('updateValue'))
      );
  }
}

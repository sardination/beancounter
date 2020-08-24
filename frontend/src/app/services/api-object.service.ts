import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiEndpointService } from './api-endpoint.service';
import { PriorIncome } from '../interfaces/prior-income';
import { BalanceSheetEntry } from '../interfaces/balance-sheet-entry';
import { WeeklyJobTransaction } from '../interfaces/weekly-job-transaction';
import { Transaction } from '../interfaces/transaction';


@Injectable({
  providedIn: 'root'
})
class ApiObjectService<T extends {id: number}> extends ApiEndpointService {

  paramType: string;

  constructor(protected http: HttpClient, apiExtension: string, paramType: string) {
      super(http, apiExtension);
      this.paramType = paramType
  }

  getObjects(): Observable<T[]> {
      return this.http.get<T[]>(this.apiUrl);
  }

  addObject(object: T): Observable<T> {
      return this.http.post<T>(this.apiUrl, object, this.httpOptions).pipe(
          tap((newObject: T) => console.log(`added ${this.paramType} with id=${newObject.id}`)),
          catchError(this.handleError<T>('addObject'))
      );
  }

  updateObject(object: T): Observable<T> {
      return this.http.put<T>(this.apiUrl, object, this.httpOptions).pipe(
          tap((updatedObject: T) => console.log(`updated ${this.paramType} with id=${updatedObject.id}`)),
          catchError(this.handleError<T>('updateObject'))
      );
  }

  deleteObject(object: T): Observable<T> {
    var options = this.httpOptions;
    options.params = new HttpParams().set('id', object.id.toString());
    return this.http.delete<T>(this.apiUrl, this.httpOptions).pipe(
      tap((removedObject: T) => console.log(`removed ${this.paramType} with id=${removedObject.id}`)),
      catchError(this.handleError<T>('deleteObject'))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class PriorIncomeService extends ApiObjectService<PriorIncome> {
    constructor (protected http: HttpClient) {
        super(http, 'prior-income', 'prior income');
    }
}

@Injectable({
  providedIn: 'root'
})
export class BalanceSheetService extends ApiObjectService<BalanceSheetEntry> {
    constructor (protected http: HttpClient) {
        super(http, 'balance-sheet', 'balance sheet');
    }
}

@Injectable({
  providedIn: 'root'
})
export class WeeklyJobTransactionService extends ApiObjectService<WeeklyJobTransaction> {
    constructor (protected http: HttpClient) {
        super(http, 'weekly-job-transaction', 'weekly job transaction');
    }
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends ApiObjectService<Transaction> {
    constructor (protected http: HttpClient) {
        super(http, 'transaction', 'transaction');
    }
}

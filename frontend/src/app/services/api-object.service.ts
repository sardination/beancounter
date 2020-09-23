import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { ApiEndpointService } from './api-endpoint.service';
import { PriorIncome } from '../interfaces/prior-income';
import { BalanceSheetEntry } from '../interfaces/balance-sheet-entry';
import { WeeklyJobTransaction } from '../interfaces/weekly-job-transaction';
import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';
import { MonthInfo } from '../interfaces/month-info';
import { MonthReflection } from '../interfaces/month-reflection';
import { MonthCategory } from '../interfaces/month-category';
import { InvestmentIncome } from '../interfaces/investment-income';


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
      return this.getObjectsWithParams(this.apiUrl, {});
  }

  getObjectsWithParams(params: any): Observable<T[]> {
      return this.http.get<T[]>(this.apiUrl, {params: params})
                .pipe(
                  map(objects => {
                    objects.forEach(object => {
                      if (object.date) {
                        let dateParts = object.date.split('-'); // YYYY-MM-DD
                        object.date = new Date(dateParts[0], dateParts[1]-1, dateParts[2]); // months are 0-indexed
                        return object
                      }
                    })
                    return objects;
                  })
                );
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

@Injectable({
  providedIn: 'root'
})
export class TransactionCategoryService extends ApiObjectService<TransactionCategory> {
    constructor (protected http: HttpClient) {
        super(http, 'transaction-category', 'transaction category');
    }
}

@Injectable({
  providedIn: 'root'
})
export class MonthInfoService extends ApiObjectService<MonthInfo> {
    constructor (protected http: HttpClient) {
        super(http, 'month-info', 'month info');
    }
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentIncomeService extends ApiObjectService<InvestmentIncome> {
    constructor (protected http: HttpClient) {
        super(http, 'investment-income', 'investment income');
    }
}

@Injectable({
  providedIn: 'root'
})
export class MonthReflectionService extends ApiObjectService<MonthReflection> {
    constructor (protected http: HttpClient) {
        super(http, 'month-reflection', 'month reflection');
    }
}

@Injectable({
  providedIn: 'root'
})
export class MonthCategoryService extends ApiObjectService<MonthCategory> {
    constructor (protected http: HttpClient) {
        super(http, 'month-category', 'month-category relation');
    }
}

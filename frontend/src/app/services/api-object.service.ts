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
import { MonthAssetAccountEntry } from '../interfaces/month-asset-account-entry';
import { AssetAccount } from '../interfaces/asset-account';
import { MonthInfo } from '../interfaces/month-info';
import { MonthReflection } from '../interfaces/month-reflection';
import { MonthCategory } from '../interfaces/month-category';
import { InvestmentIncome } from '../interfaces/investment-income';
import { ExchangeRate } from '../interfaces/exchange-rate';


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
      return this.getObjectsWithParams(null);
  }

  containsDate(arg: any): arg is {date: Date} {
    return !(!(arg as {date: Date}).date);
  }

  convertDateIfComponent(object: any): any {
    if (!this.containsDate(object)) {
      return object;
    }
    let dateParts = object.date.toString().split('-'); // YYYY-MM-DD
    object.date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2])); // months are 0-indexed
    return object
  }

  convertCustomComponent(object: any): any {
    // Need to override where necessary
    return object
  }

  getObjectsWithParams(params: any): Observable<T[]> {
      // return this.http.get<T[]>(this.apiUrl, {params: params})
      return this.sendRequest<T[]>("GET", this.apiUrl, params)
                .pipe(
                  map(objects => {
                    objects.forEach(object => {
                      return this.convertCustomComponent(this.convertDateIfComponent(object));
                    })
                    return objects;
                  })
                );
  }

  addObject(object: T): Observable<T> {
      // return this.http.post<T>(this.apiUrl, object, this.httpOptions).pipe(
      return this.sendRequest<T>("POST", this.apiUrl, undefined, object).pipe(
          map(newObject => {
            return this.convertCustomComponent(this.convertDateIfComponent(newObject));
          }),
          tap((newObject: T) => console.log(`added ${this.paramType} with id=${newObject.id}`)),
          catchError(this.handleError<T>('addObject'))
      );
  }

  updateObject(object: T): Observable<T> {
      // return this.http.put<T>(this.apiUrl, object, this.httpOptions).pipe(
      return this.sendRequest<T>("PUT", this.apiUrl, undefined, object).pipe(
          map(updatedObject => {
            return this.convertCustomComponent(this.convertDateIfComponent(updatedObject));
          }),
          tap((updatedObject: T) => console.log(`updated ${this.paramType} with id=${updatedObject.id}`)),
          catchError(this.handleError<T>('updateObject'))
      );
  }

  deleteObject(object: T): Observable<T> {
    // var options = this.httpOptions;
    // options.params = new HttpParams().set('id', object.id.toString());
    const params = new HttpParams().set('id', object.id.toString())
    // return this.http.delete<T>(this.apiUrl, this.httpOptions).pipe(
    return this.sendRequest<T>("DELETE", this.apiUrl, params, object).pipe(
      map(removedObject => {
          return this.convertCustomComponent(this.convertDateIfComponent(removedObject));
        }),
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
export class AssetAccountService extends ApiObjectService<AssetAccount> {
    constructor (protected http: HttpClient) {
        super(http, 'asset-account', 'asset account');
    }

    convertDateIfComponent(object: AssetAccount): AssetAccount {
        let dateParts = object.open_date.toString().split('-'); // YYYY-MM-DD
        object.open_date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2])); // months are 0-indexed

        if (object.close_date) {
          dateParts = object.close_date.toString().split('-'); // YYYY-MM-DD
          object.close_date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1])-1, parseInt(dateParts[2])); // months are 0-indexed
        }

        return object
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

@Injectable({
  providedIn: 'root'
})
export class MonthAssetAccountEntryService extends ApiObjectService<MonthAssetAccountEntry> {
    constructor (protected http: HttpClient) {
        super(http, 'month-asset-account-entry', 'month-asset account relation');
    }
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService extends ApiObjectService<ExchangeRate> {
    constructor (protected http: HttpClient) {
        super(http, 'exchange-rate', 'exchange rate');
    }
}

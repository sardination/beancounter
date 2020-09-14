import { Component, OnInit, Inject } from '@angular/core';

import {
    MonthCategoryService,
    MonthInfoService,
    TransactionService,
    TransactionCategoryService
} from '../../services/api-object.service';

import { Transaction } from '../../interfaces/transaction';
import { TransactionCategory } from '../../interfaces/transaction-category';
import { MonthCategory } from '../../interfaces/month-category';
import { MonthInfo } from '../../interfaces/month-info';

@Component({
  selector: 'app-step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.css']
})
export class StepThreeComponent implements OnInit {
    // this also includes step 4

   selectedMonthInfo: MonthInfo;
   transactions: Transaction[] = [];

   get transactionCategories(): TransactionCategory[] {
       return this._transactionCategories;
   }
   set transactionCategories(transactionCategories: TransactionCategory[]) {
       this._transactionCategories = transactionCategories.concat([]);
   }
   private _transactionCategories = [];

   // NOTE: frontend has month zero-indexed and backend has month one-indexed
   months = [
     "January",
     "February",
     "March",
     "April",
     "May",
     "June",
     "July",
     "August",
     "September",
     "October",
     "November",
     "December"
   ]
   earliestDate: Date = new Date();
   todayDate: Date = new Date();
   selectedYear: number;
   selectedMonth: number;
   realHourlyWage: number;

   // key category_id, value month-category
   monthCategories: Map<number, MonthCategory> = new Map<number, MonthCategory>();

  constructor(
      private transactionCategoryService: TransactionCategoryService,
      private transactionService: TransactionService,
      private monthCategoryService: MonthCategoryService,
      private monthInfoService: MonthInfoService
   ) { }

  ngOnInit(): void {
      this.selectYear(this.todayDate.getFullYear());
      this.selectMonth(this.todayDate.getMonth());
      this.getTransactions();
      this.getTransactionCategories();
  }

  showCompleteButton(): boolean {
      if (this.selectedMonthInfo == undefined) return false;
      if (!this.selectedMonthInfo.completed) return true;
      return false;
  }

  getTransactions(): void {
      this.transactionService.getObjects()
          .subscribe(transactions => {
              this.transactions = transactions.filter(transaction => transaction.transaction_type == "expenditure");
              this.transactions.forEach(transaction => {
                  if (transaction.date < this.earliestDate) {
                      this.earliestDate = transaction.date;
                  }
              });
          })
  }

  getTransactionCategories(): void {
      this.transactionCategoryService.getObjects()
          .subscribe(transactionCategories => {
              this.setTransactionCategories(transactionCategories);
          })
  }

  setTransactionCategories(categories: TransactionCategory[]): void {
      this.transactionCategories = categories;
  }

  getTransactionsByMonth(year: number, month: number): Transaction[] {
      return this.transactions.filter(transaction => {
          return transaction.date.getMonth() == month && transaction.date.getFullYear() == year}
      )
  }

  getMonthCategories(): void {
      if (this.selectedMonthInfo == undefined) return;
      this.monthCategoryService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
          .subscribe(monthCategoriesList => {
              let newMonthCategories: Map<number, MonthCategory> = new Map<number, MonthCategory>();
              monthCategoriesList.forEach(monthCategory => {
                  newMonthCategories.set(monthCategory.category_id, monthCategory);
              })
              this.monthCategories = newMonthCategories;
          })
  }

  getMonthsFromYear(year: number): number[] {
      var retArray: number[];
      var startMonth = 0;
      var endMonth = 11;
      if (year == this.earliestDate.getFullYear()) {
          startMonth = this.earliestDate.getMonth();
      }
      if (year == this.todayDate.getFullYear()) {
          endMonth = this.todayDate.getMonth();
      }
      retArray = Array.from(Array(endMonth - startMonth + 1), (_,i) => i + startMonth);
      retArray.reverse();
      return retArray;
  }

  getYears(): number[] {
      let startYear = this.earliestDate.getFullYear();
      let endYear = this.todayDate.getFullYear();
      let retArray = Array.from(Array(endYear - startYear + 1), (_,i) => i + startYear).reverse();
      return retArray;
  }

  selectYear(year: number): void {
      if (this.selectedYear == year) return;
      this.selectedYear = year;
      if (this.selectedMonth == undefined) return;
      this.updateMonthInfoAndCategories();
  }

  selectMonth(month: number): void {
      if (this.selectedMonth == month) return;
      this.selectedMonth = month;
      if (this.selectedYear == undefined) return;
      this.updateMonthInfoAndCategories();
  }

  betweenEarliestAndLatest(year: number, month: number): boolean {
      if (year == this.earliestDate.getFullYear()) return month >= this.earliestDate.getMonth();
      if (year == this.todayDate.getFullYear()) return month <= this.todayDate.getMonth();
      return year > this.earliestDate.getFullYear() && year < this.todayDate.getFullYear();
  }

  updateMonthInfoAndCategories(): void {
      // backend has month one-indexed
      this.monthInfoService.getObjectsWithParams({'year': this.selectedYear, 'month': this.selectedMonth})
          .subscribe(monthInfos => {
              if (monthInfos.length > 0) {
                this.selectedMonthInfo = monthInfos[0];
                this.getMonthCategories();
              } else if (monthInfos.length == 0 && this.betweenEarliestAndLatest(this.selectedYear, this.selectedMonth)) {
                  var monthInfo: MonthInfo = {
                      year: this.selectedYear,
                      month: this.selectedMonth
                  } as MonthInfo;
                  this.monthInfoService.addObject(monthInfo)
                      .subscribe(newMonthInfo => {
                          this.selectedMonthInfo = newMonthInfo;
                          this.getMonthCategories();
                      });
              }
          })
  }

  markCurrentMonthComplete(): void {
      if (this.selectedMonthInfo == undefined) return;
      this.selectedMonthInfo.completed = true;
      this.monthInfoService.updateObject(this.selectedMonthInfo)
          .subscribe(updatedMonthInfo => {
              this.selectedMonthInfo = updatedMonthInfo;
          })
  }

}

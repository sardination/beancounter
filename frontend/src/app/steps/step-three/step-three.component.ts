import { Component, OnInit, Inject } from '@angular/core';

import {
    TransactionService,
    TransactionCategoryService
} from '../../services/api-object.service';

import { Transaction } from '../../interfaces/transaction';
import { TransactionCategory } from '../../interfaces/transaction-category';

@Component({
  selector: 'app-step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.css']
})
export class StepThreeComponent implements OnInit {

   transactions: Transaction[] = [];

   get transactionCategories(): TransactionCategory[] {
       return this._transactionCategories;
   }
   set transactionCategories(transactionCategories: TransactionCategory[]) {
       this._transactionCategories = transactionCategories.concat([]);
   }
   private _transactionCategories = [];

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
   selectedYear: number = this.todayDate.getFullYear();
   selectedMonth: number = this.todayDate.getMonth();

  constructor(
      private transactionCategoryService: TransactionCategoryService,
      private transactionService: TransactionService
   ) { }

  ngOnInit(): void {
      this.getTransactions();
      this.getTransactionCategories();
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
      this.selectedYear = year;
  }

  selectMonth(month: number): void {
      this.selectedMonth = month;
  }

}

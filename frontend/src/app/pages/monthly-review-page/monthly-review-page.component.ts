import { Component, OnInit, Inject } from '@angular/core';

import {
    InvestmentIncomeService,
    MonthAssetAccountEntryService,
    MonthCategoryService,
    MonthInfoService,
    TransactionService,
    TransactionCategoryService
} from '../../services/api-object.service';
import { InfoService } from '../../services/info.service';

import { Transaction } from '../../interfaces/transaction';
import { TransactionCategory } from '../../interfaces/transaction-category';
import { MonthAssetAccountEntry } from '../../interfaces/month-asset-account-entry';
import { MonthCategory } from '../../interfaces/month-category';
import { MonthInfo } from '../../interfaces/month-info';
import { InvestmentIncome } from '../../interfaces/investment-income';

@Component({
  selector: 'app-monthly-review-page',
  templateUrl: './monthly-review-page.component.html',
  styleUrls: ['./monthly-review-page.component.css']
})
export class MonthlyReviewPageComponent implements OnInit {

   transactions: Transaction[] = [];
   // investmentIncomes: InvestmentIncome[] = [];

   selectedMonthInfo: MonthInfo;
   selectedTransactions: Transaction[] = [];
   selectedInvestmentIncomes: InvestmentIncome[] = [];
   selectedMonthAssetAccountEntries: MonthAssetAccountEntry[] = [];

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
   startDate: Date = new Date();
   todayDate: Date = new Date();
   selectedYear: number;
   selectedMonth: number;
   realHourlyWage: number;

   // key category_id, value month-category
   monthCategories: Map<number, MonthCategory> = new Map<number, MonthCategory>();

  constructor(
      private transactionCategoryService: TransactionCategoryService,
      private transactionService: TransactionService,
      private monthAssetAccountEntryService: MonthAssetAccountEntryService,
      private monthCategoryService: MonthCategoryService,
      private monthInfoService: MonthInfoService,
      private investmentIncomeService: InvestmentIncomeService,
      private infoService: InfoService
   ) { }

  ngOnInit(): void {
      this.setStartDate();
      this.selectYear(this.todayDate.getFullYear());
      this.selectMonth(this.todayDate.getMonth());
      this.getTransactions();
      this.getTransactionCategories();
      // this.getInvestmentIncomes();
  }

  showCompleteButton(): boolean {
      if (this.selectedMonthInfo == undefined) return false;
      if (this.monthInProgress()) return false;
      if (!this.selectedMonthInfo.completed) return true;
      return false;
  }

  monthInProgress(): boolean {
    return (this.selectedYear == this.todayDate.getFullYear()) && (this.selectedMonth == this.todayDate.getMonth());
  }

  setStartDate(): void {
      this.infoService.getInfo("start_date")
          .subscribe(info => {
            let dateParts = info.value.split("-");
            this.startDate = new Date(dateParts[0], dateParts[1]-1, dateParts[2]); // month is 0-indexed
          });
  }

  getTransactions(): void {
      this.transactionService.getObjects()
          .subscribe(transactions => {
              this.transactions = transactions.filter(transaction => transaction.transaction_type == "expenditure");
              if (this.selectedMonthInfo !== undefined) {
                  this.getTransactionsByMonth(
                      this.selectedMonthInfo.year,
                      this.selectedMonthInfo.month
                  );
              }
          })
  }

  getTransactionCategories(): void {
      this.transactionCategoryService.getObjects()
          .subscribe(transactionCategories => {
              this.setTransactionCategories(transactionCategories);
          })
  }

  // getInvestmentIncomes(): void {
  //     this.investmentIncomeService.getObjects()
  //         .subscribe(investmentIncomes => {
  //             this.investmentIncomes = investmentIncomes;

  //             if (this.selectedMonthInfo !== undefined) {
  //                 this.selectedInvestmentIncomes = this.getInvestmentIncomesByMonthInfo();
  //             }
  //         })
  // }

  setTransactionCategories(categories: TransactionCategory[]): void {
      this.transactionCategories = categories;
  }

  // getTransactionsByMonth(year: number, month: number): Transaction[] {
  getTransactionsByMonth(year: number, month: number): void {
      this.selectedTransactions = this.transactions.filter(transaction => {
          return transaction.date.getMonth() == month && transaction.date.getFullYear() == year}
      )
  }

  // getInvestmentIncomesByMonthInfo(): InvestmentIncome[] {
  getInvestmentIncomesByMonthInfo(): void {
      if (this.selectedMonthInfo == undefined) return;
      this.investmentIncomeService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
          .subscribe(investmentIncomeList => {
              this.selectedInvestmentIncomes = investmentIncomeList;
          })
      // return this.investmentIncomes.filter(investmentIncome => {
      //     return investmentIncome.month_info_id == this.selectedMonthInfo.id;
      // })
  }

  getAssetAccountEntriesByMonthInfo(): void {
    if (this.selectedMonthInfo == undefined) return;
    this.monthAssetAccountEntryService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
        .subscribe(assetAccountEntryList => {
            this.selectedMonthAssetAccountEntries = assetAccountEntryList;
        })
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
      if (year == this.startDate.getFullYear()) {
          startMonth = this.startDate.getMonth();
      }
      if (year == this.todayDate.getFullYear()) {
          endMonth = this.todayDate.getMonth();
      }
      retArray = Array.from(Array(endMonth - startMonth + 1), (_,i) => i + startMonth);
      retArray.reverse();
      return retArray;
  }

  getYears(): number[] {
      let startYear = this.startDate.getFullYear();
      let endYear = this.todayDate.getFullYear();
      let retArray = Array.from(Array(endYear - startYear + 1), (_,i) => i + startYear).reverse();
      return retArray;
  }

  selectYear(year: number): void {
      if (this.selectedYear == year) return;
      this.selectedYear = year;
      // select the latest month in the year
      let thisYearMonths = this.getMonthsFromYear(year);
      if (thisYearMonths.length == 0) {
          this.selectedMonth = undefined;
          return;
      }
      this.selectedMonth = thisYearMonths[0];
      this.updateMonthInfoAndCategories();
  }

  selectMonth(month: number): void {
      if (this.selectedMonth == month) return;
      this.selectedMonth = month;
      if (this.selectedYear == undefined) return;
      this.updateMonthInfoAndCategories();
  }

  betweenStartAndLatest(year: number, month: number): boolean {
      if (year == this.startDate.getFullYear()) return month >= this.startDate.getMonth();
      if (year == this.todayDate.getFullYear()) return month <= this.todayDate.getMonth();
      return year > this.startDate.getFullYear() && year < this.todayDate.getFullYear();
  }

  updateMonthInfoAndCategories(): void {
      // backend has month one-indexed
      this.monthInfoService.getObjectsWithParams({'year': this.selectedYear, 'month': this.selectedMonth})
          .subscribe(monthInfos => {
              if (monthInfos.length > 0) {
                this.selectedMonthInfo = monthInfos[0];
                this.updateArrays();
              } else if (monthInfos.length == 0 && this.betweenStartAndLatest(this.selectedYear, this.selectedMonth)) {
                  var monthInfo: MonthInfo = {
                      year: this.selectedYear,
                      month: this.selectedMonth
                  } as MonthInfo;
                  this.monthInfoService.addObject(monthInfo)
                      .subscribe(newMonthInfo => {
                          this.selectedMonthInfo = newMonthInfo;
                          this.updateArrays();
                      });
              }
          })
  }

  updateArrays(): void {
      this.getMonthCategories();
      // this.selectedInvestmentIncomes = this.getInvestmentIncomesByMonthInfo();
      this.getInvestmentIncomesByMonthInfo();
      this.getTransactionsByMonth(this.selectedMonthInfo.year, this.selectedMonthInfo.month);
      this.getAssetAccountEntriesByMonthInfo();
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

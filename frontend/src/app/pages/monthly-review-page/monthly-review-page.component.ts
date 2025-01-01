import { Component, OnInit, Inject } from '@angular/core';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { Moment } from 'moment';
import { UntypedFormControl } from '@angular/forms';
import { faChevronCircleLeft, faChevronCircleRight, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';

import {
    AssetAccountService,
    ExchangeRateService,
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
import { AssetAccount } from '../../interfaces/asset-account';
import { ExchangeRate } from '../../interfaces/exchange-rate';

export const YEARMONTH_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-monthly-review-page',
  templateUrl: './monthly-review-page.component.html',
  styleUrls: ['./monthly-review-page.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: YEARMONTH_FORMATS}
  ]
})
export class MonthlyReviewPageComponent implements OnInit {

  faChevronCircleLeft = faChevronCircleLeft;
  faChevronCircleRight = faChevronCircleRight;
  faQuestionCircle = faQuestionCircle;

   transactions: Transaction[] = [];

   normalizedSelectedDate = new UntypedFormControl(moment());

   selectedMonthInfo: MonthInfo;
   selectedTransactions: Transaction[] = [];
   selectedExpenditures: Transaction[] = [];
   selectedInvestmentIncomes: InvestmentIncome[] = [];
   selectedMonthAssetAccountEntries: MonthAssetAccountEntry[] = [];
   selectedAssetAccounts: AssetAccount[] = [];
   selectedExchangeRates: ExchangeRate[] = [];
   selectedCurrencies: string[] = [];

   get transactionCategories(): TransactionCategory[] {
       return this._transactionCategories;
   }
   set transactionCategories(transactionCategories: TransactionCategory[]) {
       this._transactionCategories = transactionCategories.concat([]);
   }
   private _transactionCategories = [];

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
      private assetAccountService: AssetAccountService,
      private exchangeRateService: ExchangeRateService,
      private infoService: InfoService
   ) { }

  ngOnInit(): void {
      this.setStartDate();
      this.selectedMonth = this.todayDate.getMonth();
      this.selectYear(this.todayDate.getFullYear());
      this.getTransactions();
      this.getTransactionCategories();
  }

  existsNonUSDCurrencies(): boolean {
    return this.selectedCurrencies.length > 0
  }

  allExchangeRatesSet(): boolean {
    var exchangeRateMap = new Map<string, number>()
    this.selectedExchangeRates.forEach(exchangeRate => {
      exchangeRateMap.set(exchangeRate.currency, exchangeRate.rate)
    })
    for (var i = 0; i < this.selectedCurrencies.length; i++) {
      if (!exchangeRateMap.get(this.selectedCurrencies[i])) {
        return false;
      }
    }
    return true;
  }

  setStartDate(): void {
      this.infoService.getInfo("start_date")
          .subscribe(info => {
            this.startDate = info.value;
          });
  }

  getTransactions(): void {
      // TODO: should we only be getting the transactions for that month?
      this.transactionService.getObjects()
          .subscribe(transactions => {
              this.transactions = transactions;
              // this.transactions = transactions.filter(transaction => transaction.transaction_type == "expenditure");
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

  setTransactionCategories(categories: TransactionCategory[]): void {
      this.transactionCategories = categories;
  }

  // getTransactionsByMonth(year: number, month: number): Transaction[] {
  getTransactionsByMonth(year: number, month: number): void {
      this.selectedTransactions = this.transactions.filter(transaction => {
          return transaction.date.getMonth() == month && transaction.date.getFullYear() == year}
      )
      this.selectedExpenditures = this.selectedTransactions.filter(
        transaction => transaction.transaction_type == "expenditure"
      )
      this.getSelectedCurrencies()
  }

  getInvestmentIncomesByMonthInfo(): void {
      if (this.selectedMonthInfo == undefined) return;
      this.investmentIncomeService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
          .subscribe(investmentIncomeList => {
              this.selectedInvestmentIncomes = investmentIncomeList;
              this.getSelectedCurrencies()
          })
  }

  getAssetAccountEntriesByMonthInfo(): void {
    if (this.selectedMonthInfo == undefined) return;
    this.monthAssetAccountEntryService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
        .subscribe(assetAccountEntryList => {
            this.selectedMonthAssetAccountEntries = assetAccountEntryList;
        })
  }

  getAssetAccountsByMonthInfo(): void {
    if (this.selectedMonthInfo == undefined) return;
    this.assetAccountService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
        .subscribe(assetAccountList => {
          this.selectedAssetAccounts = assetAccountList;
          this.getSelectedCurrencies()
        })
  }

  getExchangeRatesByMonthInfo(): void {
    if (this.selectedMonthInfo == undefined) return;
    this.exchangeRateService.getObjectsWithParams({'month_info_id': this.selectedMonthInfo.id})
        .subscribe(exchangeRateList => {
          this.selectedExchangeRates = exchangeRateList
        })
  }

  setSelectedExchangeRates(exchangeRates: ExchangeRate[]): void {
    this.selectedExchangeRates = [].concat(exchangeRates)
  }

  getSelectedCurrencies(): void {
    var selectedCurrencies: string[] = []
    selectedCurrencies = selectedCurrencies.concat(this.selectedTransactions.map(transaction => transaction.currency))
    selectedCurrencies = selectedCurrencies.concat(this.selectedAssetAccounts.map(assetAccount => assetAccount.currency))
    selectedCurrencies = selectedCurrencies.concat(this.selectedInvestmentIncomes.map(investmentIncome => investmentIncome.currency))
    selectedCurrencies = [...new Set(selectedCurrencies)]
    const usdIndex = selectedCurrencies.indexOf("USD");
    if (usdIndex > -1) { // only splice array when item is found
      selectedCurrencies.splice(usdIndex, 1); // 2nd parameter means remove one item only
    }
    this.selectedCurrencies = selectedCurrencies
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
      /*
          Call selectMonth this function when you need to change the current month
          and retrieve all of its info and update visuals.
      */
      // if (this.selectedYear == year) return;
      this.selectedYear = year;
      // select the latest month in the year
      let thisYearMonths = this.getMonthsFromYear(year);
      if (thisYearMonths.length == 0) {
          this.selectedMonth = undefined;
          return;
      }
      // if there is only valid month, the current month is too low, or the current month is too high,
      //    then set the current month to the earliest valid month
      if (
        thisYearMonths.length == 1 ||
        this.selectedMonth > thisYearMonths[0] ||
        this.selectedMonth < thisYearMonths[thisYearMonths.length - 1]
      ) {
          this.selectedMonth = thisYearMonths[0];
      }
      this.updateMonthInfoAndCategories();

      // set value in the form control
      const ctrlValue = this.normalizedSelectedDate.value;
      ctrlValue.year(this.selectedYear);
      ctrlValue.month(this.selectedMonth);
      this.normalizedSelectedDate.setValue(ctrlValue);
  }

  selectYearHandler(normalizedDate: Moment) {
      /*
        Set the year and month based on the selected date
      */

      if (this.selectedYear == normalizedDate.year()) return;

      this.selectYear(normalizedDate.year());
  }

  // selectMonth(month: number): void {
  //     // if (this.selectedMonth == month) return;
  //     this.selectedMonth = month;
  //     // if (this.selectedYear == undefined) return;
  //     // this.updateMonthInfoAndCategories();
  // }

  selectMonthHandler(normalizedDate: Moment, datepicker: MatDatepicker<Moment>) {
      /*
        Set the month and year based on the selected date
      */

      if (this.selectedMonth == normalizedDate.month() && this.selectedYear == normalizedDate.year()) return;

      this.selectedMonth = normalizedDate.month();
      this.selectYear(normalizedDate.year());

      datepicker.close();
  }

  incrementSelectedMonth(increment: number): void {
      let potentialMonth = this.selectedMonth + increment;
      let potentialYear = this.selectedYear;
      if (potentialMonth < 0 || potentialMonth > 11) {
          potentialYear += Math.floor(potentialMonth / 12);
          potentialMonth = potentialMonth % 12;
          if (potentialMonth < 0) {
              potentialMonth = 12 + potentialMonth;
          }
      }

      if (this.betweenStartAndLatest(potentialYear, potentialMonth)) {
          this.selectedMonth = potentialMonth;
          this.selectYear(potentialYear);

          const ctrlValue = this.normalizedSelectedDate.value;
          ctrlValue.month(potentialMonth);
          ctrlValue.year(potentialYear);
          this.normalizedSelectedDate.setValue(ctrlValue);
      }
  }

  selectedMonthInfoHasPassed(): boolean {
      if (this.selectedMonthInfo == undefined) {
          return false;
      }

      let todayYear = this.todayDate.getFullYear();
      let todayMonth = this.todayDate.getMonth();
      if (
          todayYear > this.selectedMonthInfo.year ||
          (todayYear == this.selectedMonthInfo.year && todayMonth > this.selectedMonthInfo.month)
      ) {
          return true;
      }

      return false;
  }

  betweenStartAndLatest(year: number, month: number): boolean {
      if (year == this.startDate.getFullYear()) return month >= this.startDate.getMonth();
      if (year == this.todayDate.getFullYear()) return month <= this.todayDate.getMonth();
      return year > this.startDate.getFullYear() && year < this.todayDate.getFullYear();
  }

  updateMonthInfoAndCategories(): void {
      let firstTime = this.selectedMonthInfo === undefined;
      // backend has month one-indexed
      this.monthInfoService.getObjectsWithParams({'year': this.selectedYear, 'month': this.selectedMonth})
          .subscribe(monthInfos => {
              if (monthInfos.length > 0) {
                this.selectedMonthInfo = monthInfos[0];
                this.updateArrays();
                if (firstTime) {
                    this.usePriorMonthInfoIfIncomplete();
                }
              } else if (this.betweenStartAndLatest(this.selectedYear, this.selectedMonth)) {
                  var monthInfo: MonthInfo = {
                      year: this.selectedYear,
                      month: this.selectedMonth
                  } as MonthInfo;
                  this.monthInfoService.addObject(monthInfo)
                      .subscribe(newMonthInfo => {
                          this.selectedMonthInfo = newMonthInfo;
                          this.updateArrays();
                          if (firstTime) {
                            this.usePriorMonthInfoIfIncomplete();
                          }
                      });
              }
              // the very first time that monthInfo is set (prev value undefined),
              //    check if the previous month is still incomplete and default
              //    to the previous month instead for display purposes
          })
  }

  usePriorMonthInfoIfIncomplete(): void {
    /*
      This should only be called the very first time that selectedMonthInfo is set.
      If the previous month is existent and incomplete, then the page should
      default to the previous month instead of the current month.
    */
      let prevMonth = this.selectedMonth - 1;
      let prevYear = this.selectedYear
      if (prevMonth == -1) {
          prevMonth = 11;
          prevYear -= 1;
      }
      this.monthInfoService.getObjectsWithParams({'year': prevYear, 'month': prevMonth})
          .subscribe(monthInfos => {
              if (monthInfos.length > 0) {
                if (!monthInfos[0].completed) {
                  this.selectedMonth = prevMonth;
                  this.selectYear(prevYear);
                }
              }
          })
  }

  updateArrays(): void {
      this.getMonthCategories();
      this.getInvestmentIncomesByMonthInfo();
      this.getTransactionsByMonth(this.selectedMonthInfo.year, this.selectedMonthInfo.month);
      this.getAssetAccountEntriesByMonthInfo();
      this.getAssetAccountsByMonthInfo();
      this.getExchangeRatesByMonthInfo();
  }

}

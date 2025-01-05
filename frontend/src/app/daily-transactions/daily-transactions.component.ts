import { Component, OnInit, Input } from '@angular/core';

import {
  ExchangeRateService,
  MonthInfoService,
  TransactionService
} from '../services/api-object.service';

import { Transaction } from '../interfaces/transaction';

@Component({
  selector: 'app-daily-transactions',
  templateUrl: './daily-transactions.component.html',
  styleUrls: ['./daily-transactions.component.css']
})
export class DailyTransactionsComponent implements OnInit {

  @Input() startDate: Date;

  transactions: Transaction[] = [];

  monthInfoMap: Map<number, Map<number, number>>; // year, month, month_info_id
  exchangeRateMap: Map<number, Map<string, number>>; // month_info_id, currency, rate

  totalIncome: number = 0;
  totalExpenditures: number = 0;

  constructor(
    private transactionService: TransactionService,
    private exchangeRateService: ExchangeRateService,
    private monthInfoService: MonthInfoService
  ) { }

  ngOnInit(): void {
      this.getMonthInfosAndExchangeRates();
      this.getTransactions();
  }

  getMonthInfosAndExchangeRates(): void {
    this.monthInfoService.getObjects()
      .subscribe(monthInfos => {
        this.monthInfoMap = new Map<number, Map<number, number>>();
        this.exchangeRateMap = new Map<number, Map<string, number>>()
        for (var i = 0; i < monthInfos.length; i++) {
          let monthInfo = monthInfos[i]
          let yearMap = this.monthInfoMap.get(monthInfo.year)
          if (!yearMap) {
            yearMap = new Map<number, number>()
            this.monthInfoMap.set(monthInfo.year, yearMap)
          }
          yearMap.set(monthInfo.month, monthInfo.id)

          this.exchangeRateMap.set(monthInfo.id, new Map<string, number>())
          this.exchangeRateService.getObjectsWithParams({'month_info_id': monthInfo.id})
            .subscribe(exchangeRates => {
              for (var i = 0; i < exchangeRates.length; i++) {
                let exchangeRate = exchangeRates[i]
                let currencyMap = this.exchangeRateMap.get(exchangeRate.month_info_id)
                currencyMap.set(exchangeRate.currency, exchangeRate.rate)
              }
              this.calculateTotalIncome();
              this.calculateTotalExpenditures();
            })
        }
      })
  }

  getTransactions(): void {
      this.transactionService.getObjects()
          .subscribe(transactions => {
              this.transactions = transactions;
              this.calculateTotalIncome();
              this.calculateTotalExpenditures();
          })
  }

  setTransactions(transactions: Transaction[]): void {
    this.transactions = transactions;
    this.calculateTotalIncome();
    this.calculateTotalExpenditures();
  }

  calculateTotalIncome(): void {
      if (!this.transactions || !this.monthInfoMap || !this.exchangeRateMap) {
        this.totalIncome = 0;
        return;
      }
      this.totalIncome = this.transactions
                  .filter(transaction => transaction.transaction_type == "income")
                  .reduce((sum, current) => {
                      if (current.currency == "USD") return sum + current.value
                      let monthInfoId = this.monthInfoMap.get(current.date.getFullYear()).get(current.date.getMonth())
                      let currencyMap = this.exchangeRateMap.get(monthInfoId)
                      if (!currencyMap) return sum
                      let rate = currencyMap.get(current.currency)
                      if (!rate) return sum
                      return sum + current.value / rate
                    },
                    0);
  }

  calculateTotalExpenditures(): void {
      if (!this.transactions || !this.monthInfoMap || !this.exchangeRateMap) {
        this.totalExpenditures = 0;
        return;
      }
      this.totalExpenditures = this.transactions
                  .filter(transaction => transaction.transaction_type == "expenditure")
                  .reduce((sum, current) => {
                      if (current.currency == "USD") return sum + current.value
                      let monthInfoId = this.monthInfoMap.get(current.date.getFullYear()).get(current.date.getMonth())
                      let currencyMap = this.exchangeRateMap.get(monthInfoId)
                      if (!currencyMap) return sum
                      let rate = currencyMap.get(current.currency)
                      if (!rate) return sum
                      return sum + current.value / rate
                    },
                    0);
  }

}

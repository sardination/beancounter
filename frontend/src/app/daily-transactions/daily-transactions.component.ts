import { Component, OnInit, Input } from '@angular/core';

import { TransactionService } from '../services/api-object.service';

import { Transaction } from '../interfaces/transaction';

@Component({
  selector: 'app-daily-transactions',
  templateUrl: './daily-transactions.component.html',
  styleUrls: ['./daily-transactions.component.css']
})
export class DailyTransactionsComponent implements OnInit {

  @Input() startDate: Date;

  transactions: Transaction[] = [];
  totalIncome: number = 0;
  totalExpenditures: number = 0;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
      this.getTransactions();
  }

  getTransactions(): void {
      this.transactionService.getObjects()
          .subscribe(transactions => {
              this.transactions = transactions;
              this.calculateTotalIncome();
              this.calculateTotalExpenditures();
          })
  }

  calculateTotalIncome(): void {
      if (!this.transactions) {
        this.totalIncome = 0;
      }
      this.totalIncome = this.transactions
                  .filter(transaction => transaction.transaction_type == "income")
                  .reduce((sum, current) => sum + current.value, 0);
  }

  calculateTotalExpenditures(): void {
      if (!this.transactions) {
        this.totalExpenditures = 0;
      }
      this.totalExpenditures = this.transactions
                  .filter(transaction => transaction.transaction_type == "expenditure")
                  .reduce((sum, current) => sum + current.value, 0);
  }

}

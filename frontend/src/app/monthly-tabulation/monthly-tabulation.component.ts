import { Component, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { getCurrencySymbol } from '../currency/utils'

import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';

import { TransactionService } from '../services/api-object.service';

@Component({
  selector: 'app-monthly-tabulation',
  templateUrl: './monthly-tabulation.component.html',
  styleUrls: ['./monthly-tabulation.component.css']
})
export class MonthlyTabulationComponent implements OnInit {

  getCurrencySymbol = getCurrencySymbol

  @Input()
  get transactions(): Transaction[] { return this._transactions };
  set transactions(transactions: Transaction[]) {
      this._transactions = transactions.sort((a, b) => {
          if (a.date > b.date) {
              return -1;
          } else if (a.date < b.date) {
              return 1;
          } else {
              return 0;
          }
      });
      if (!this.tableDataSource) {
          this.tableDataSource = new MatTableDataSource<Transaction>(this._transactions);
      } else {
          this.tableDataSource.data = this._transactions;
          this.tableDataSource._updateChangeSubscription();
      }
  }
  private _transactions: Transaction[];

  @Input()
  get categories(): TransactionCategory[] { return this._categories }
  set categories(categories: TransactionCategory[]) {
      this._categories = categories;
      this.displayCategories = [{name: "uncategorized"} as TransactionCategory].concat(categories);
  }
  private _categories: TransactionCategory[];
  displayCategories: TransactionCategory[];

  tableDataSource: MatTableDataSource<Transaction>;
  columnsToDisplay = ['date', 'value', 'description', 'category'];

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
  }

  updateTransactionCategory(transaction: Transaction, categoryID: number): void {
      transaction.category_id = categoryID;
      this.transactionService.updateObject(transaction)
          .subscribe(newTransaction => Object.assign(transaction,newTransaction));
  }

}

import { Component, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';

@Component({
  selector: 'app-monthly-tabulation',
  templateUrl: './monthly-tabulation.component.html',
  styleUrls: ['./monthly-tabulation.component.css']
})
export class MonthlyTabulationComponent implements OnInit {

  @Input()
  get transactions(): Transaction[] { return this._transactions };
  set transactions(transactions: Transaction[]) {
    this._transactions = transactions;
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<Transaction>(this._transactions);
    } else {
      this.tableDataSource.data = this._transactions;
      this.tableDataSource._updateChangeSubscription();
    }
  }
  private _transactions: Transaction[];

  @Input()
  categories: TransactionCategory[];

  tableDataSource: MatTableDataSource<Transaction>;
  columnsToDisplay = ['date', 'value', 'description', 'category'];

  constructor() { }

  ngOnInit(): void {
  }

}

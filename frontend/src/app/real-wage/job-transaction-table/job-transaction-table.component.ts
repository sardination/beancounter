import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { WeeklyJobTransaction } from '../../interfaces/weekly-job-transaction';

@Component({
  selector: 'app-job-transaction-table',
  templateUrl: './job-transaction-table.component.html',
  styleUrls: ['./job-transaction-table.component.css']
})
export class JobTransactionTableComponent implements OnInit {

  @Input()
  get weeklyJobTransactions(): WeeklyJobTransaction[] { return this._weeklyJobTransactions };
  set weeklyJobTransactions(weeklyJobTransactions: WeeklyJobTransaction[]) {
    this._weeklyJobTransactions = weeklyJobTransactions
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<WeeklyJobTransaction>(this._weeklyJobTransactions);
    } else {
      this.tableDataSource.data = this._weeklyJobTransactions;
      this.tableDataSource._updateChangeSubscription();
    }
  };
  private _weeklyJobTransactions: WeeklyJobTransaction[];
  @Output() deleteTransactionEvent = new EventEmitter<WeeklyJobTransaction>();

  tableDataSource: MatTableDataSource<WeeklyJobTransaction>;
  columnsToDisplay = ['description', 'hours', 'value', 'delete'];

  constructor() { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<WeeklyJobTransaction>(this.weeklyJobTransactions);
  }

  deleteJobTransaction(transaction: WeeklyJobTransaction): void {
    this.deleteTransactionEvent.emit(transaction);
  }

}

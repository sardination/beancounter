import { Component, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

import { TransactionService } from '../../services/api-object.service';

import { Transaction } from '../../interfaces/transaction';

@Component({
  selector: 'app-daily-transaction-table',
  templateUrl: './daily-transaction-table.component.html',
  styleUrls: ['./daily-transaction-table.component.css']
})
export class DailyTransactionTableComponent implements OnInit {

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
  editingTransaction: Transaction;

  tableDataSource: MatTableDataSource<Transaction>;
  columnsToDisplay = ['date', 'value', 'description', 'edit', 'delete'];

  transactionTypes = [
    {key:'income', label:"Income"},
    {key:'expenditure', label:"Expenditure"},
  ]

  editingTransactionDate: FormControl;
  editingTransactionType: FormControl;
  editingTransactionValue: FormControl;
  editingTransactionDescription: FormControl;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<Transaction>(this.transactions);
  }

  selectEditingTransaction(editingTransaction: Transaction): void {
    this.setFormControls(editingTransaction);
    this.tableDataSource.data = this.transactions;
    this.editingTransaction = editingTransaction;
  }

  zeroFormControls(): void {
    this.editingTransactionDate = new FormControl();
    this.editingTransactionType = new FormControl("expenditure");
    this.editingTransactionValue = new FormControl(0);
    this.editingTransactionDescription = new FormControl("");
  }

  setFormControls(transaction: Transaction): void {
    this.editingTransactionDate = new FormControl(transaction.date);
    if (transaction.transaction_type == "income") {
        this.editingTransactionType = new FormControl("income");
    } else {
        this.editingTransactionType = new FormControl("expenditure");
    }
    this.editingTransactionValue = new FormControl(transaction.value);
    this.editingTransactionDescription = new FormControl(transaction.description);
  }

  addNewEmptyTransaction(): void {
    this.zeroFormControls();
    var emptyTransaction: Transaction;
    this.editingTransaction = emptyTransaction;
    this.tableDataSource.data = [emptyTransaction].concat(this.transactions);
  }

  cancelEditTransaction(): void {
    this.tableDataSource.data = this.transactions;
    this.editingTransaction = null;
  }

  updateEditingTransaction(): void {
      this.tableDataSource.data = this.transactions;
      this.updateEditingTransactionFromFormControls();
      var transaction = this.editingTransaction;

      if (!transaction.date || !transaction.value || !transaction.description) return;
      if (!transaction.id) {
        this.transactionService.addObject(transaction)
            .subscribe(newTransaction => {
                this.transactions.push(newTransaction);
                this.transactions = this.transactions;
                this.tableDataSource.data = this.transactions;
                this.editingTransaction = null;
            })
      } else {
        this.transactionService.updateObject(transaction)
            .subscribe(updatedTransaction => {
                transaction = updatedTransaction;
                this.transactions = this.transactions;
                this.tableDataSource.data = this.transactions;
                this.editingTransaction = null;
            })
      }
  }

  updateEditingTransactionFromFormControls(): void {
    if (this.editingTransaction == undefined) {
      this.editingTransaction =  {
        id: 0,
        date: this.editingTransactionDate.value,
        value: this.editingTransactionValue.value,
        transaction_type: this.editingTransactionType.value,
        description: this.editingTransactionDescription.value.trim()
      } as Transaction;
    } else {
      this.editingTransaction.date = this.editingTransactionDate.value;
      this.editingTransaction.value = this.editingTransactionValue.value;
      this.editingTransaction.transaction_type = this.editingTransactionType.value;
      this.editingTransaction.description = this.editingTransactionDescription.value.trim();
    }
  }

  deleteTransaction(transaction: Transaction): void {
    this.transactionService.deleteObject(transaction)
        .subscribe(deletedTransaction => {
          // have to use original entry due to addressing
          this.transactions.splice(this.transactions.indexOf(transaction), 1);
          if (this.editingTransaction == null) {
            this.tableDataSource.data = this.transactions;
          } else {
            this.tableDataSource.data = [this.editingTransaction].concat(this.transactions);
          }
          this.tableDataSource._updateChangeSubscription();
        })
  }

}

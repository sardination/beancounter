import { Component, OnInit, Input, Output, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { faEdit, faCheck, faTrash, faTimes, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { TransactionService } from '../../services/api-object.service';

import { Transaction } from '../../interfaces/transaction';

@Component({
  selector: 'app-daily-transaction-table',
  templateUrl: './daily-transaction-table.component.html',
  styleUrls: ['./daily-transaction-table.component.css']
})
export class DailyTransactionTableComponent implements OnInit, AfterViewInit {

  faEdit = faEdit;
  faCheck = faCheck;
  faTrash = faTrash;
  faTimes = faTimes;
  faPlusSquare = faPlusSquare;

  todayDate: Date = new Date();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() startDate: Date;

  @Output() updateTransactions = new EventEmitter<Transaction[]>();

  @Input()
  get transactions(): Transaction[] { return this._transactions };
  set transactions(transactions: Transaction[]) {
    this._transactions = this.sortTransactions(transactions);
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

  editingTransactionDate: UntypedFormControl;
  editingTransactionType: UntypedFormControl;
  editingTransactionValue: UntypedFormControl;
  editingTransactionDescription: UntypedFormControl;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<Transaction>(this.transactions);
  }

  ngAfterViewInit(): void {
      this.tableDataSource.paginator = this.paginator;
  }

  selectEditingTransaction(editingTransaction: Transaction): void {
    this.setFormControls(editingTransaction);
    this.tableDataSource.data = this.transactions;
    this.editingTransaction = editingTransaction;
  }

  sortTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.sort((a, b) => {
        if (a.date > b.date) {
            return -1;
        } else if (a.date < b.date) {
            return 1;
        } else {
            return 0;
        }
    });
  }

  zeroFormControls(): void {
    this.editingTransactionDate = new UntypedFormControl(this.todayDate);
    this.editingTransactionType = new UntypedFormControl("expenditure");
    this.editingTransactionValue = new UntypedFormControl(0);
    this.editingTransactionDescription = new UntypedFormControl("");
  }

  setFormControls(transaction: Transaction): void {
    this.editingTransactionDate = new UntypedFormControl(transaction.date);
    if (transaction.transaction_type == "income") {
        this.editingTransactionType = new UntypedFormControl("income");
    } else {
        this.editingTransactionType = new UntypedFormControl("expenditure");
    }
    this.editingTransactionValue = new UntypedFormControl(transaction.value);
    this.editingTransactionDescription = new UntypedFormControl(transaction.description);
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

  validateFormControls(): boolean {
    let valid = true;
    if (!this.editingTransactionDate.value ||
        this.editingTransactionDate.value > this.todayDate ||
        this.editingTransactionDate.value < this.startDate
    ) {
      this.editingTransactionDate.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingTransactionDate.setErrors(null);
    }

    if (!this.editingTransactionValue.value) {
      this.editingTransactionValue.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingTransactionValue.setErrors(null);
    }

    if (!this.editingTransactionDescription.value) {
      this.editingTransactionDescription.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingTransactionDescription.setErrors(null);
    }

    // TODO: checking for type (not necessary right now)

    return valid;
  }

  updateEditingTransaction(): void {
      if (!this.validateFormControls()) return;
      this.tableDataSource.data = this.transactions;
      this.updateEditingTransactionFromFormControls();
      var transaction = this.editingTransaction;

      if (!transaction.id) {
        this.transactionService.addObject(transaction)
            .subscribe(newTransaction => {
                this.transactions.push(newTransaction);
                this.transactions = this.sortTransactions(this.transactions)
                this.editingTransaction = null;
                this.updateTransactions.emit(this.transactions);
            })
      } else {
        this.transactionService.updateObject(transaction)
            .subscribe(updatedTransaction => {
                transaction = updatedTransaction;
                this.transactions = this.sortTransactions(this.transactions);
                this.editingTransaction = null;
                this.updateTransactions.emit(this.transactions);
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
          this.updateTransactions.emit(this.transactions);
        })
  }

}

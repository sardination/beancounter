import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WeeklyJobTransactionService } from '../services/api-object.service';

import { WeeklyJobTransaction } from '../interfaces/weekly-job-transaction';

@Component({
  selector: 'app-real-wage',
  templateUrl: './real-wage.component.html',
  styleUrls: ['./real-wage.component.css']
})
export class RealWageComponent implements OnInit {

  weeklyJobTransactions: WeeklyJobTransaction[];

  constructor(
      private weeklyJobTransactionService: WeeklyJobTransactionService,
      public addJobTransactionDialog: MatDialog
  ) { }

  ngOnInit(): void {
      this.getWeeklyJobTransactions();
  }

  getWeeklyJobTransactions(): void {
      this.weeklyJobTransactionService.getObjects()
          .subscribe(weeklyJobTransactions => {
              this.weeklyJobTransactions = weeklyJobTransactions;
          })
  }

  openAddJobTransactionDialog(): void {
    const dialogRef = this.addJobTransactionDialog.open(AddJobTransactionDialog, {
      width: "250",
      data: {} as WeeklyJobTransaction
    });

    dialogRef.afterClosed().subscribe(newTransaction => {
      if (newTransaction) {
        this.addJobTransaction(newTransaction);
      }
    });
  }

  addJobTransaction(transaction: WeeklyJobTransaction): void {
      if (!transaction.value || !transaction.hours || !transaction.transaction_type || !transaction.description) return;
      this.weeklyJobTransactionService.addObject(transaction)
          .subscribe(newTransaction => {
              // this.weeklyJobTransactions.unshift(newTransaction);
              this.weeklyJobTransactions = [newTransaction].concat(this.weeklyJobTransactions);
          })
  }

  deleteJobTransaction(transaction: WeeklyJobTransaction): void {
      this.weeklyJobTransactionService.deleteObject(transaction)
          .subscribe(deletedTransaction => {
            this.weeklyJobTransactions.splice(this.weeklyJobTransactions.indexOf(deletedTransaction), 1);
            this.weeklyJobTransactions = [].concat(this.weeklyJobTransactions);
          })
  }

  calculateRealHourlyWage(): number {
      if (!this.weeklyJobTransactions) {
          return 0;
      }
      var totalIncome = this.weeklyJobTransactions.reduce((sum, current) => {
          if (current.transaction_type == "income") {
              return sum + current.value;
          }
          return sum - current.value;
      }, 0);
      var totalHours = this.weeklyJobTransactions.reduce((sum, current) => sum + current.hours, 0);
      return totalIncome / totalHours;
  }

}

@Component({
  selector: 'add-job-transaction-dialog',
  templateUrl: './add-job-transaction-dialog.component.html'
})
export class AddJobTransactionDialog {

  transactionTypes = [
    {key:'income', label:"Income"},
    {key:'expenditure', label:"Expenditure"},
  ]

  constructor(
    public dialogRef: MatDialogRef<AddJobTransactionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WeeklyJobTransaction
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

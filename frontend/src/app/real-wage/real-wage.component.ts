import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { WeeklyJobTransactionService } from '../services/api-object.service';
import { InfoService } from '../services/info.service';

import { WeeklyJobTransaction } from '../interfaces/weekly-job-transaction';

@Component({
  selector: 'app-real-wage',
  templateUrl: './real-wage.component.html',
  styleUrls: ['./real-wage.component.css']
})
export class RealWageComponent implements OnInit {

  faPlusSquare = faPlusSquare;

  weeklyJobTransactions: WeeklyJobTransaction[];
  realHourlyWage: number;

  constructor(
      private weeklyJobTransactionService: WeeklyJobTransactionService,
      private infoService: InfoService,
      public addJobTransactionDialog: MatDialog
  ) { }

  ngOnInit(): void {
      this.getWeeklyJobTransactions();
      this.getRealHourlyWage();
  }

  getWeeklyJobTransactions(): void {
      this.weeklyJobTransactionService.getObjects()
          .subscribe(weeklyJobTransactions => {
              this.weeklyJobTransactions = weeklyJobTransactions;
          })
  }

  getRealHourlyWage(): void {
      this.infoService.getInfo("real_hourly_wage")
            .subscribe(info => {
                this.realHourlyWage = Number(info.value);
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
              this.weeklyJobTransactions = [newTransaction].concat(this.weeklyJobTransactions);
              this.infoService.updateInfo("real_hourly_wage", this.calculateRealHourlyWage().toString())
                  .subscribe(info => {
                      this.realHourlyWage = Number(info.value);
                  })
          })
  }

  deleteJobTransaction(transaction: WeeklyJobTransaction): void {
      this.weeklyJobTransactionService.deleteObject(transaction)
          .subscribe(deletedTransaction => {
            // can't use deletedTransaction object below because of addressing
            this.weeklyJobTransactions.splice(this.weeklyJobTransactions.indexOf(transaction), 1);
            this.weeklyJobTransactions = [].concat(this.weeklyJobTransactions);
            this.infoService.updateInfo("real_hourly_wage", this.calculateRealHourlyWage().toString())
                  .subscribe(info => {
                      this.realHourlyWage = Number(info.value);
                  })
          })
  }

  calculateRealHourlyWage(): number {
      if (this.weeklyJobTransactions.length == 0) {
          return 0;
      }
      var totalIncome = this.weeklyJobTransactions.reduce((sum, current) => {
          if (current.transaction_type == "income") {
              return sum + current.value;
          }
          return sum - current.value;
      }, 0);
      var totalHours = this.weeklyJobTransactions.reduce((sum, current) => sum + current.hours, 0);
      if (totalHours == 0) {
        return totalIncome;
      }
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

import { Component, OnInit } from '@angular/core';
import { formatNumber } from '@angular/common';

import { FormControl } from '@angular/forms';

import { InfoService } from '../../services/info.service';

@Component({
  selector: 'app-fi-projection-page',
  templateUrl: './fi-projection-page.component.html',
  styleUrls: ['./fi-projection-page.component.css']
})
export class FIProjectionPageComponent implements OnInit {

  // monthlyExpenseFormControl: FormControl = new FormControl();
  // longTermInterestRateFormControl: FormControl = new FormControl();

  monthlyExpense: number = 0;
  longTermInterestRate: number = 0;

  monthlyExpenseString: string = "";
  longTermInterestRateString: string = "";

  constructor(private infoService: InfoService) { }

  ngOnInit(): void {
      this.getInfoValues();
  }

  getInfoValues(): void {
      this.infoService.getInfo("average_monthly_expense")
          .subscribe(info =>  {
              this.monthlyExpense = info.value;
              this.monthlyExpenseString = this.valueToString(this.monthlyExpense);
          });

      this.infoService.getInfo("long_term_interest_rate")
          .subscribe(info =>  {
              this.longTermInterestRate = info.value;
              this.longTermInterestRateString = this.valueToString(this.longTermInterestRate);
          });
  }

  valueToString(value: number): string {
    let parts = value.toString().split(".");
    console.log(parts.length == 2 && parts[1].length == 1)
    if (parts.length == 1) {
      return `${parts[0]}.00`;
    } else if (parts.length == 2 && parts[1].length == 1) {
      return `${parts[0]}.${parts[1]}0`;
    }
    return value.toString();
  }

  updateMonthlyExpense(monthlyExpense: number) {
    this.infoService.updateInfo("average_monthly_expense", monthlyExpense)
        .subscribe(info => {
            this.monthlyExpense = info.value;
        });
  }

  updateLongTermInterestRate(interestRate: number) {
    this.infoService.updateInfo("long_term_interest_rate", interestRate)
        .subscribe(info => {
            this.longTermInterestRate = info.value;
        });
  }

  onBlur(): void {
    this.monthlyExpenseString = this.valueToString(this.monthlyExpense);
    this.longTermInterestRateString = this.valueToString(this.longTermInterestRate);
  }

  // updateProjectionValues(): void {
  //     this.infoService.updateInfo("average_monthly_expense", this.monthlyExpenseFormControl.value)
  //         .subscribe(info => this.monthlyExpenseFormControl.setValue(info.value));
  //     this.infoService.updateInfo("long_term_interest_rate", this.longTermInterestRateFormControl.value)
  //         .subscribe(info => this.longTermInterestRateFormControl.setValue(info.value));
  // }

  calculateRetirementRequirement(): number {
      // Assume that a safe retirement withdrawal rate is the same as the interest rate. This way,
      //  having the calculated amount of assets and withdrawing will result in net loss zero
      //  because you will be withdrawing the same amount of money that you will be earning via interest.

      if (this.longTermInterestRate == 0) {
          return 0;
      }

      return (12 * this.monthlyExpense) / (this.longTermInterestRate / 100);
  }

}

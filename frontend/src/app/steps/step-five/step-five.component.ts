import { Component, OnInit } from '@angular/core';

import { FormControl } from '@angular/forms';

import { InfoService } from '../../services/info.service';

@Component({
  selector: 'app-step-five',
  templateUrl: './step-five.component.html',
  styleUrls: ['./step-five.component.css']
})
export class StepFiveComponent implements OnInit {

    monthlyExpenseFormControl: FormControl = new FormControl();
    longTermInterestRateFormControl: FormControl = new FormControl();

  constructor(private infoService: InfoService) { }

  ngOnInit(): void {
      this.getInfoValues();
  }

  getInfoValues(): void {
      this.infoService.getInfo("average_monthly_expense")
          .subscribe(info => this.monthlyExpenseFormControl = new FormControl(info.value));
      this.infoService.getInfo("long_term_interest_rate")
          .subscribe(info => this.longTermInterestRateFormControl = new FormControl(info.value));
  }

  updateProjectionValues(): void {
      this.infoService.updateInfo("average_monthly_expense", this.monthlyExpenseFormControl.value)
          .subscribe(info => this.monthlyExpenseFormControl.setValue(info.value));
      this.infoService.updateInfo("long_term_interest_rate", this.longTermInterestRateFormControl.value)
          .subscribe(info => this.longTermInterestRateFormControl.setValue(info.value));
  }

  calculateRetirementRequirement(): number {
      // Assume that a safe retirement withdrawal rate is the same as the interest rate. This way,
      //  having the calculated amount of assets and withdrawing will result in net loss zero
      //  because you will be withdrawing the same amount of money that you will be earning via interest.

      if (this.longTermInterestRateFormControl.value == 0) {
          return 0;
      }

      return (12 * this.monthlyExpenseFormControl.value) / (this.longTermInterestRateFormControl.value / 100);
  }

}

import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-wage-calculator',
  templateUrl: './wage-calculator.component.html',
  styleUrls: ['./wage-calculator.component.css']
})
export class WageCalculatorComponent {

  annualIncome = new FormControl(0);
  dailyWorkHours = new FormControl(8);
  dailyCommuteHours = new FormControl(1);
  weeklyWorkDays = new FormControl(5);

  calculateRealHourlyWage() {
      var annualUsedHours = (this.dailyWorkHours.value + this.dailyCommuteHours.value) * this.weeklyWorkDays.value * 52;
      return this.annualIncome.value / (annualUsedHours);
  }

}

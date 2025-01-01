import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UntypedFormControl } from '@angular/forms';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { MonthInfo } from '../interfaces/month-info';
import { MonthReflection } from '../interfaces/month-reflection';

import { MonthReflectionService, MonthInfoService } from '../services/api-object.service';

@Component({
  selector: 'app-monthly-reflection',
  templateUrl: './monthly-reflection.component.html',
  styleUrls: ['./monthly-reflection.component.css']
})
export class MonthlyReflectionComponent implements OnInit {

  faExclamationCircle = faExclamationCircle;

  todayDate: Date = new Date();

  @Output() updateMonthInfo = new EventEmitter();

  @Input()
  disableSaveButton: boolean = false;
  @Input()
  disableSaveMessage: string = '';

  @Input()
  get monthInfo(): MonthInfo {return this._monthInfo;}
  set monthInfo(monthInfo: MonthInfo) {
      let oldMonthInfo = this._monthInfo;
      this._monthInfo = monthInfo;
      // only get new reflection if the month info has actually changed
      if (!oldMonthInfo || !monthInfo || oldMonthInfo.month != monthInfo.month || oldMonthInfo.year != monthInfo.year) {
        this.getReflection();
      }
  }
  private _monthInfo: MonthInfo;

  get monthReflection(): MonthReflection {return this._monthReflection;}
  set monthReflection(monthReflection: MonthReflection) {
      this._monthReflection = monthReflection;
      if (monthReflection == undefined) return;
      this.employmentPurposeEntry.setValue(monthReflection.q_employment_purpose);
      this.spendingManagementEntry.setValue(monthReflection.q_spending_evaluation);
      this.livingDyingEntry.setValue(monthReflection.q_living_dying);
  }
  private _monthReflection: MonthReflection;

  employmentPurposeEntry: UntypedFormControl = new UntypedFormControl();
  spendingManagementEntry: UntypedFormControl = new UntypedFormControl();
  livingDyingEntry: UntypedFormControl = new UntypedFormControl();

  constructor(
    private monthReflectionService: MonthReflectionService,
    private monthInfoService: MonthInfoService,
  ) { }

  ngOnInit(): void {

  }

  getReflection(): void {
      if (this.monthInfo == undefined) {
        this.monthReflection = {} as MonthReflection;
        return;
      }
      this.monthReflectionService.getObjectsWithParams({'month_info_id': this.monthInfo.id})
          .subscribe(monthReflections => {
              let todayYear = this.todayDate.getFullYear();
              let todayMonth = this.todayDate.getMonth();
              if (monthReflections.length > 0) {
                  this.monthReflection = monthReflections[0];
              } else if (
                todayYear > this.monthInfo.year ||
                (todayYear == this.monthInfo.year && todayMonth > this.monthInfo.month)) {
                // if this month-info has passed, then create a new reflection
                  let monthReflection = {
                      month_info_id: this.monthInfo.id
                  } as MonthReflection;
                  this.monthReflectionService.addObject(monthReflection)
                      .subscribe(newMonthReflection => {
                          this.monthReflection = newMonthReflection;
                      })
              } else {
                this.monthReflection = {} as MonthReflection;
              }
          })
  }

  saveReflection(): void {
    /*
      Save the reflection and then re-retrieve the month info to check for completion
    */
      let updatingMonthReflection = this.monthReflection;
      updatingMonthReflection.q_employment_purpose = this.employmentPurposeEntry.value;
      updatingMonthReflection.q_spending_evaluation = this.spendingManagementEntry.value;
      updatingMonthReflection.q_living_dying = this.livingDyingEntry.value;
      this.monthReflectionService.updateObject(updatingMonthReflection)
          .subscribe(updatedMonthReflection => {
              Object.assign(this.monthReflection, updatedMonthReflection);
              this.updateMonthInfo.emit();
          })
  }

}

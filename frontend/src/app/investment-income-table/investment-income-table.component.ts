import { Component, OnInit, Input } from '@angular/core';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl } from '@angular/forms';
import { faEdit, faCheck, faTrash, faTimes, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { InvestmentIncomeService } from '../services/api-object.service';

import { getCurrencySymbol } from '../currency/utils'

import { InvestmentIncome } from '../interfaces/investment-income';
import { MonthInfo } from '../interfaces/month-info';

@Component({
  selector: 'app-investment-income-table',
  templateUrl: './investment-income-table.component.html',
  styleUrls: ['./investment-income-table.component.css'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ]
})
export class InvestmentIncomeTableComponent implements OnInit {

  faEdit = faEdit;
  faCheck = faCheck;
  faTrash = faTrash;
  faTimes = faTimes;
  faPlusSquare = faPlusSquare;

  getCurrencySymbol = getCurrencySymbol

  @Input()
  get investmentIncomes(): InvestmentIncome[] { return this._investmentIncomes };
  set investmentIncomes(investmentIncomes: InvestmentIncome[]) {
    this._investmentIncomes = this.sortIncomes(investmentIncomes);
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<InvestmentIncome>(this._investmentIncomes);
    } else {
      this.tableDataSource.data = this._investmentIncomes;
      this.tableDataSource._updateChangeSubscription();
    }
  }
  private _investmentIncomes: InvestmentIncome[];
  editingIncome: InvestmentIncome;

  @Input()
  get monthInfo(): MonthInfo { return this._monthInfo };
  set monthInfo(monthInfo: MonthInfo) {
      this.cancelEditIncome();
      this._monthInfo = monthInfo;

      const today = new Date();
      this.minDate = new Date(this.monthInfo.year, this.monthInfo.month, 1);
      if (this.startDate && this.startDate.getMonth() == this.monthInfo.month &&
          this.startDate.getFullYear() == this.monthInfo.year &&
          this.startDate > this.minDate) {
        this.minDate = this.startDate;
      }

      if (this.minDate.getMonth() != today.getMonth() || this.minDate.getFullYear() != today.getFullYear()) {
        this.maxDate = new Date(this.monthInfo.year, this.monthInfo.month + 1, 0); // last day of month
      } else {
        // if today does fall under the currently evaluated month, then keep maxDate as today
        this.maxDate = new Date();
      }
  }
  private _monthInfo: MonthInfo;

  maxDate: Date = new Date();
  minDate: Date = new Date();

  @Input()
  get startDate(): Date { return this._startDate };
  set startDate(startDate: Date) {
    this._startDate = startDate;
    this.monthInfo = this.monthInfo;
  }
  private _startDate: Date;

  tableDataSource: MatTableDataSource<InvestmentIncome>;
  columnsToDisplay = ['date', 'type', 'value', 'description', 'edit', 'delete'];

  investmentIncomeTypes = [
    {key:'interest', label:"Interest"},
    {key:'dividend', label:"Dividend"},
    {key:'capital_gain', label:"Capital Gain"},
    {key:'rent', label:"Rent"},
    {key:'royalty', label:"Royalty"},
  ]

  editingIncomeDate: UntypedFormControl;
  editingIncomeType: UntypedFormControl;
  editingIncomeValue: UntypedFormControl;
  editingIncomeDescription: UntypedFormControl;
  editingIncomeCurrency: UntypedFormControl;

  constructor(private investmentIncomeService: InvestmentIncomeService) { }

  ngOnInit(): void {
      this.tableDataSource = new MatTableDataSource<InvestmentIncome>(this.investmentIncomes);
  }

  getLabelFromTypeKey(key: string): string {
      var label = "";
      this.investmentIncomeTypes.forEach(
          investmentIncomeType => {
              if (investmentIncomeType.key == key) {
                  label = investmentIncomeType.label;
              }
          }
      )
      return label;
  }

  selectEditingIncome(editingIncome: InvestmentIncome): void {
    this.setFormControls(editingIncome);
    this.tableDataSource.data = this.investmentIncomes;
    this.editingIncome = editingIncome;
  }

  zeroFormControls(): void {
    this.editingIncomeDate = new UntypedFormControl();
    this.editingIncomeType = new UntypedFormControl("interest");
    this.editingIncomeValue = new UntypedFormControl(0);
    this.editingIncomeDescription = new UntypedFormControl("");
    this.editingIncomeCurrency = new UntypedFormControl("USD");
  }

  setFormControls(income: InvestmentIncome): void {
    if (income.date) {
        this.editingIncomeDate = new UntypedFormControl(income.date.toISOString().substring(0,10));
    } else {
        this.editingIncomeDate = new UntypedFormControl();
    }
    this.editingIncomeType = new UntypedFormControl(income.investment_income_type);
    this.editingIncomeValue = new UntypedFormControl(income.value);
    this.editingIncomeDescription = new UntypedFormControl(income.description);
    this.editingIncomeCurrency = new UntypedFormControl(income.currency);
  }

  addNewEmptyIncome(): void {
    this.zeroFormControls();
    var emptyIncome: InvestmentIncome;
    this.editingIncome = emptyIncome;
    this.tableDataSource.data = [emptyIncome].concat(this.investmentIncomes);
  }

  cancelEditIncome(): void {
    if (this.tableDataSource) {
        this.tableDataSource.data = this.investmentIncomes;
    }
    this.editingIncome = null;
  }

  validateFormControls(): boolean {
    let valid = true;
    if (this.editingIncomeDate.value &&
        (this.editingIncomeDate.value > this.maxDate ||
        this.editingIncomeDate.value < this.minDate)
    ) {
      this.editingIncomeDate.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingIncomeDate.setErrors(null);
    }

    if (!this.editingIncomeValue.value) {
      this.editingIncomeValue.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingIncomeValue.setErrors(null);
    }

    if (!this.editingIncomeDescription.value) {
      this.editingIncomeDescription.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingIncomeDescription.setErrors(null);
    }

    // TODO: checking for type (not necessary right now)

    return valid;
  }

  updateEditingIncome(): void {
      if (!this.validateFormControls()) return;
      this.tableDataSource.data = this.investmentIncomes;
      this.updateEditingIncomeFromFormControls();
      var income = this.editingIncome;

      if (!income.id) {
        this.investmentIncomeService.addObject(income)
            .subscribe(newIncome => {
                this.investmentIncomes.push(newIncome);
                this.investmentIncomes = this.sortIncomes(this.investmentIncomes);
                this.tableDataSource.data = this.investmentIncomes;
                this.editingIncome = null;
            })
      } else {
        this.investmentIncomeService.updateObject(income)
            .subscribe(updatedIncome => {
                Object.assign(income, updatedIncome);
                this.investmentIncomes = this.sortIncomes(this.investmentIncomes);
                this.tableDataSource.data = this.investmentIncomes;
                this.editingIncome = null;
            })
      }
  }

  updateEditingIncomeFromFormControls(): void {
    if (this.editingIncome == undefined) {
      this.editingIncome =  {
        id: 0,
        month_info_id: this.monthInfo.id,
        date: this.editingIncomeDate.value,
        value: this.editingIncomeValue.value,
        investment_income_type: this.editingIncomeType.value,
        description: this.editingIncomeDescription.value.trim(),
        currency: this.editingIncomeCurrency.value
      } as InvestmentIncome;
    } else {
      this.editingIncome.date = this.editingIncomeDate.value;
      this.editingIncome.value = this.editingIncomeValue.value;
      this.editingIncome.investment_income_type = this.editingIncomeType.value;
      this.editingIncome.description = this.editingIncomeDescription.value.trim();
      this.editingIncome.currency = this.editingIncomeCurrency.value;
    }
  }

  deleteIncome(income: InvestmentIncome): void {
    this.investmentIncomeService.deleteObject(income)
        .subscribe(deletedIncome => {
          // have to use original entry due to addressing
          this.investmentIncomes.splice(this.investmentIncomes.indexOf(income), 1);
          if (this.editingIncome == null) {
            this.tableDataSource.data = this.investmentIncomes;
          } else {
            this.tableDataSource.data = [this.editingIncome].concat(this.investmentIncomes);
          }
          this.tableDataSource._updateChangeSubscription();
        })
  }

  sortIncomes(incomes: InvestmentIncome[]): InvestmentIncome[] {
    if (!incomes) {
      return [];
    }
    return incomes.sort((a, b) => {
        if (a.date > b.date) {
            return -1;
        } else if (a.date < b.date) {
            return 1;
        } else {
            return 0;
        }
    });
  }

}

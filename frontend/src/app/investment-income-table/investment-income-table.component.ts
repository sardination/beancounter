import { Component, OnInit, Input } from '@angular/core';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { faEdit, faCheck, faTrash, faTimes, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { InvestmentIncomeService } from '../services/api-object.service';

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

      if (this.minDate.getMonth() != today.getMonth() || this.minDate.getFullYear() != today.getFullYear()) {
        this.maxDate = new Date(this.monthInfo.year, this.monthInfo.month + 1, 0); // last day of month
      }
  }
  private _monthInfo: MonthInfo;

  maxDate: Date = new Date();
  minDate: Date = new Date();

  tableDataSource: MatTableDataSource<InvestmentIncome>;
  columnsToDisplay = ['date', 'type', 'value', 'description', 'edit', 'delete'];

  investmentIncomeTypes = [
    {key:'interest', label:"Interest"},
    {key:'dividend', label:"Dividend"},
    {key:'capital_gain', label:"Capital Gain"},
    {key:'rent', label:"Rent"},
    {key:'royalty', label:"Royalty"},
  ]

  editingIncomeDate: FormControl;
  editingIncomeType: FormControl;
  editingIncomeValue: FormControl;
  editingIncomeDescription: FormControl;

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
    this.editingIncomeDate = new FormControl();
    this.editingIncomeType = new FormControl("interest");
    this.editingIncomeValue = new FormControl(0);
    this.editingIncomeDescription = new FormControl("");
  }

  setFormControls(income: InvestmentIncome): void {
    if (income.date) {
        this.editingIncomeDate = new FormControl(income.date.toISOString().substring(0,10));
    } else {
        this.editingIncomeDate = new FormControl();
    }
    this.editingIncomeType = new FormControl(income.investment_income_type);
    this.editingIncomeValue = new FormControl(income.value);
    this.editingIncomeDescription = new FormControl(income.description);
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

  updateEditingIncome(): void {
      this.tableDataSource.data = this.investmentIncomes;
      this.updateEditingIncomeFromFormControls();
      var income = this.editingIncome;

      if (!income.value || !income.description) return;
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
                income = updatedIncome;
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
        description: this.editingIncomeDescription.value.trim()
      } as InvestmentIncome;
    } else {
      this.editingIncome.date = this.editingIncomeDate.value;
      this.editingIncome.value = this.editingIncomeValue.value;
      this.editingIncome.investment_income_type = this.editingIncomeType.value;
      this.editingIncome.description = this.editingIncomeDescription.value.trim();
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

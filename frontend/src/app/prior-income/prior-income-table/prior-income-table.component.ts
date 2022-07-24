import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { faEdit, faCheck, faTrash, faTimes, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { PriorIncomeService } from '../../services/api-object.service';

import { PriorIncome } from '../../interfaces/prior-income';

@Component({
  selector: 'app-prior-income-table',
  templateUrl: './prior-income-table.component.html',
  styleUrls: ['./prior-income-table.component.css']
})
export class PriorIncomeTableComponent implements OnInit {

  faEdit = faEdit;
  faCheck = faCheck;
  faTrash = faTrash;
  faTimes = faTimes;
  faPlusSquare = faPlusSquare;

  @Input() startDate: Date;

  @Output() updatePriorIncomes = new EventEmitter<PriorIncome[]>();

  @Input()
  get priorIncomes(): PriorIncome[] { return this._priorIncomes; };
  set priorIncomes(priorIncomes: PriorIncome[]) {
    this._priorIncomes = this.sortIncomes(priorIncomes);
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<PriorIncome>(this._priorIncomes);
    } else {
      this.tableDataSource.data = this._priorIncomes;
      this.tableDataSource._updateChangeSubscription();
    }
  };
  private _priorIncomes: PriorIncome[];
  editingIncome: PriorIncome;

  tableDataSource: MatTableDataSource<PriorIncome>;
  columnsToDisplay = ['date', 'amount', 'description', 'edit', 'delete'];

  editingIncomeDate: UntypedFormControl;
  editingIncomeAmount: UntypedFormControl;
  editingIncomeDescription: UntypedFormControl;

  constructor(private priorIncomeService: PriorIncomeService) {
  }

  ngOnInit(): void {
    this.tableDataSource = new MatTableDataSource<PriorIncome>(this.priorIncomes);
  }

  selectEditingIncome(editingIncome: PriorIncome): void {
    this.setFormControls(editingIncome);
    this.tableDataSource.data = this.priorIncomes;
    this.editingIncome = editingIncome;
  }

  zeroFormControls(): void {
    this.editingIncomeDate = new UntypedFormControl(this.startDate);
    this.editingIncomeAmount = new UntypedFormControl();
    this.editingIncomeDescription = new UntypedFormControl("");
  }

  setFormControls(priorIncome: PriorIncome): void {
    this.editingIncomeDate = new UntypedFormControl(priorIncome.date);
    this.editingIncomeAmount = new UntypedFormControl(priorIncome.amount);
    this.editingIncomeDescription = new UntypedFormControl(priorIncome.description);
  }

  addNewEmptyIncome(): void {
    this.zeroFormControls();
    var emptyIncome: PriorIncome;
    this.editingIncome = emptyIncome;
    this.tableDataSource.data = [emptyIncome].concat(this.priorIncomes);
  }

  cancelEditIncome(): void {
    this.tableDataSource.data = this.priorIncomes;
    this.editingIncome = null;
  }

  validateFormControls(): boolean {
    let valid = true;
    if (!this.editingIncomeDate.value || this.editingIncomeDate.value > this.startDate) {
      this.editingIncomeDate.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingIncomeDate.setErrors(null);
    }

    if (!this.editingIncomeAmount.value) {
      this.editingIncomeAmount.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingIncomeAmount.setErrors(null);
    }

    if (!this.editingIncomeDescription.value) {
      this.editingIncomeDescription.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingIncomeDescription.setErrors(null);
    }

    return valid;
  }

  updatePriorIncome(): void {
      if (!this.validateFormControls()) return;

      this.tableDataSource.data = this.priorIncomes;
      this.updateEditingIncomeFromFormControls();
      var priorIncome = this.editingIncome;

      if (!priorIncome.id) {
        this.priorIncomeService.addObject(priorIncome)
            .subscribe(newPriorIncome => {
                this.priorIncomes.push(newPriorIncome);
                this.priorIncomes = this.sortIncomes(this.priorIncomes);
                this.tableDataSource.data = this.priorIncomes;
                this.editingIncome = null;
                this.updatePriorIncomes.emit(this.priorIncomes);
            })
      } else {
        this.priorIncomeService.updateObject(priorIncome)
            .subscribe(updatedPriorIncome => {
                priorIncome = updatedPriorIncome;
                this.priorIncomes = this.sortIncomes(this.priorIncomes);
                this.tableDataSource.data = this.priorIncomes;
                this.editingIncome = null;
                this.updatePriorIncomes.emit(this.priorIncomes);
            })
      }
  }

  updateEditingIncomeFromFormControls(): void {
    if (this.editingIncome == undefined) {
      this.editingIncome =  {
        id: 0,
        date: this.editingIncomeDate.value,
        amount: this.editingIncomeAmount.value,
        description: this.editingIncomeDescription.value.trim()
      } as PriorIncome;
    } else {
      this.editingIncome.date = this.editingIncomeDate.value;
      this.editingIncome.amount = this.editingIncomeAmount.value;
      this.editingIncome.description = this.editingIncomeDescription.value.trim();
    }
  }

  deleteIncome(priorIncome: PriorIncome): void {
    this.priorIncomeService.deleteObject(priorIncome)
        .subscribe(deletedPriorIncome => {
          // have to use original entry due to addressing
          this.priorIncomes.splice(this.priorIncomes.indexOf(priorIncome), 1);
          if (this.editingIncome == null) {
            this.tableDataSource.data = this.priorIncomes;
          } else {
            this.tableDataSource.data = [this.editingIncome].concat(this.priorIncomes);
          }
          this.tableDataSource._updateChangeSubscription();
          this.updatePriorIncomes.emit(this.priorIncomes);
        })
  }

  sortIncomes(incomes: PriorIncome[]): PriorIncome[] {
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

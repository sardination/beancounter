import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
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

  editingIncomeDate: FormControl;
  editingIncomeAmount: FormControl;
  editingIncomeDescription: FormControl;

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
    this.editingIncomeDate = new FormControl();
    this.editingIncomeAmount = new FormControl(this.startDate);
    this.editingIncomeDescription = new FormControl("");
  }

  setFormControls(priorIncome: PriorIncome): void {
    this.editingIncomeDate = new FormControl(priorIncome.date);
    this.editingIncomeAmount = new FormControl(priorIncome.amount);
    this.editingIncomeDescription = new FormControl(priorIncome.description);
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

  updatePriorIncome(): void {
      this.tableDataSource.data = this.priorIncomes;
      this.updateEditingIncomeFromFormControls();
      var priorIncome = this.editingIncome;

      if (!priorIncome.date || !priorIncome.amount || !priorIncome.description) return;
      if (priorIncome.date > this.startDate) return;
      if (!priorIncome.id) {
        this.priorIncomeService.addObject(priorIncome)
            .subscribe(newPriorIncome => {
                this.priorIncomes.push(newPriorIncome);
                this.priorIncomes = this.sortIncomes(this.priorIncomes);
                this.tableDataSource.data = this.priorIncomes;
                this.editingIncome = null;
            })
      } else {
        this.priorIncomeService.updateObject(priorIncome)
            .subscribe(updatedPriorIncome => {
                priorIncome = updatedPriorIncome;
                this.priorIncomes = this.sortIncomes(this.priorIncomes);
                this.tableDataSource.data = this.priorIncomes;
                this.editingIncome = null;
            })
      }
  }

  updateEditingIncomeFromFormControls(): void {
    if (this.editingIncome == undefined) {
      this.editingIncome =  {
        id: 0,
        date: this.editingIncomeDate.value.toISOString().substring(0,10),
        amount: this.editingIncomeAmount.value,
        description: this.editingIncomeDescription.value.trim()
      } as PriorIncome;
    } else {
      this.editingIncome.date = this.editingIncomeDate.value.toISOString().substring(0,10);
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

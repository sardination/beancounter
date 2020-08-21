import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

import { PriorIncomeService } from '../../services/api-object.service';

import { PriorIncome } from '../../interfaces/prior-income';

@Component({
  selector: 'app-prior-income-table',
  templateUrl: './prior-income-table.component.html',
  styleUrls: ['./prior-income-table.component.css']
})
export class PriorIncomeTableComponent implements OnInit, OnChanges {

  @Input() priorIncomes: PriorIncome[];
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.priorIncomes.currentValue) {
      this.tableDataSource.data = changes.priorIncomes.currentValue;
      this.tableDataSource._updateChangeSubscription();
    }
  }

  selectEditingIncome(editingIncome: PriorIncome): void {
    this.setFormControls(editingIncome);
    this.tableDataSource.data = this.priorIncomes;
    this.editingIncome = editingIncome;
  }

  zeroFormControls(): void {
    this.editingIncomeDate = new FormControl();
    this.editingIncomeAmount = new FormControl(0);
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
      if (!priorIncome.id) {
        this.priorIncomeService.addObject(priorIncome)
            .subscribe(newPriorIncome => {
                this.priorIncomes.push(newPriorIncome);
                this.tableDataSource.data = this.priorIncomes;
                this.editingIncome = null;
            })
      } else {
        this.priorIncomeService.updateObject(priorIncome)
            .subscribe(updatedPriorIncome => {
                priorIncome = updatedPriorIncome;
                this.tableDataSource.data = this.priorIncomes;
                this.editingIncome = null;
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
          this.priorIncomes.splice(this.priorIncomes.indexOf(deletedPriorIncome), 1);
          if (this.editingIncome == null) {
            this.tableDataSource.data = this.priorIncomes;
          } else {
            this.tableDataSource.data = [this.editingIncome].concat(this.priorIncomes);
          }
          this.tableDataSource._updateChangeSubscription();
        })
  }

}

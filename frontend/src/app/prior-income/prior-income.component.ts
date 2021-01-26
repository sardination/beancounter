import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

import { PriorIncome } from '../interfaces/prior-income';
import { PriorIncomeService } from '../services/api-object.service';

@Component({
  selector: 'app-prior-income',
  templateUrl: './prior-income.component.html',
  styleUrls: ['./prior-income.component.css']
})
export class PriorIncomeComponent implements OnInit {

    get priorIncomes(): PriorIncome[] { return this._priorIncomes }
    set priorIncomes(priorIncomes: PriorIncome[]) {
      this._priorIncomes = priorIncomes;
      this.calculateTotalPriorIncome();
    }
    private _priorIncomes: PriorIncome[];

    totalPriorIncome: number;

    @Input() startDate: Date;

  constructor(private priorIncomeService: PriorIncomeService) { }

  ngOnInit(): void {
      this.getPriorIncomes();
  }

  getPriorIncomes(): void {
    this.priorIncomeService.getObjects()
      .subscribe(priorIncomes => {
        this.priorIncomes = priorIncomes;
      });
  }

  setPriorIncomes(priorIncomes: PriorIncome[]): void {
    this.priorIncomes = priorIncomes;
  }

  calculateTotalPriorIncome(): void {
    if (this.priorIncomes == undefined) {
      this.totalPriorIncome = 0;
    };
    this.totalPriorIncome = this.priorIncomes.reduce((sum, current) => sum + current.amount, 0);
  }

}
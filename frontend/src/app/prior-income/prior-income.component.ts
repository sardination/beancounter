import { Component, OnInit } from '@angular/core';
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

    priorIncomes: PriorIncome[];

  constructor(private priorIncomeService: PriorIncomeService) { }

  ngOnInit(): void {
      this.getPriorIncomes();
  }

  getPriorIncomes(): void {
    this.priorIncomeService.getObjects()
      .subscribe(priorIncomes => {
        this.priorIncomes = priorIncomes;
        // this.tableDataSource = new MatTableDataSource(this.priorIncomes);
      });
  }

  totalPriorIncome(): number {
    if (this.priorIncomes == undefined) return 0;
    return this.priorIncomes.reduce((sum, current) => sum + current.amount, 0);
  }

}
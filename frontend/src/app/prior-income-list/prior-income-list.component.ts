import { Component, OnInit } from '@angular/core';

import { PriorIncome } from '../interfaces/prior-income';
import { ApiEndpointService } from '../services/api-endpoint.service';

@Component({
  selector: 'app-prior-income-list',
  templateUrl: './prior-income-list.component.html',
  styleUrls: ['./prior-income-list.component.css']
})
export class PriorIncomeListComponent implements OnInit {

    priorIncomes: PriorIncome[];
    columnsToDisplay = ['date', 'amount', 'description'];

  constructor(private apiEndpointService: ApiEndpointService) { }

  ngOnInit(): void {
      this.getPriorIncomes();
  }

  getPriorIncomes(): void {
    this.apiEndpointService.getPriorIncomes()
      .subscribe(priorIncomes => this.priorIncomes = priorIncomes);
  }

  addPriorIncome(date: Date, amount: number, description: string): void {
    description = description.trim()
    if (!date || !amount || !description) return;
    this.apiEndpointService.addPriorIncome({date, amount, description} as PriorIncome)
        .subscribe(priorIncome => {
            this.priorIncomes.push(priorIncome);
        })
  }

  addNewEmptyIncome(): void {

  }

}
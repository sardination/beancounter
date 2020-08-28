import { Component, OnInit } from '@angular/core';

import {
    TransactionService,
    TransactionCategoryService
} from '../../services/api-object.service';

import { Transaction } from '../../interfaces/transaction';
import { TransactionCategory } from '../../interfaces/transaction-category';

@Component({
  selector: 'app-step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.css']
})
export class StepThreeComponent implements OnInit {

   transactions: Transaction[] = [];
   transactionCategories: TransactionCategory[] = [];

  constructor(
      private transactionCategoryService: TransactionCategoryService,
      private transactionService: TransactionService
   ) { }

  ngOnInit(): void {
      this.getTransactions();
      this.getTransactionCategories();
  }

  getTransactions(): void {
      this.transactionService.getObjects()
          .subscribe(transactions => {
              this.transactions = transactions;
          })
  }

  getTransactionCategories(): void {
      this.transactionCategoryService.getObjects()
          .subscribe(transactionCategories => {
              this.transactionCategories = transactionCategories;
          })
  }

}

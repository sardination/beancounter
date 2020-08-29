import { Component, OnInit, Inject } from '@angular/core';

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

   get transactionCategories(): TransactionCategory[] {
       return this._transactionCategories;
   }
   set transactionCategories(transactionCategories: TransactionCategory[]) {
       this._transactionCategories = transactionCategories.concat([]);
   }
   private _transactionCategories = [];

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
              this.setTransactionCategories(transactionCategories);
          })
  }

  setTransactionCategories(categories: TransactionCategory[]): void {
      this.transactionCategories = categories;
  }

}

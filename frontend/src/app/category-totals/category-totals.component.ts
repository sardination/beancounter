import { Component, OnInit, Input } from '@angular/core';

import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';

@Component({
  selector: 'app-category-totals',
  templateUrl: './category-totals.component.html',
  styleUrls: ['./category-totals.component.css']
})
export class CategoryTotalsComponent implements OnInit {

  @Input()
  transactions: Transaction[];

  @Input()
  get categories(): TransactionCategory[] { return this._categories }
  set categories(categories: TransactionCategory[]) {
      this._categories = [{name: "uncategorized"} as TransactionCategory].concat(categories)
  }
  private _categories: TransactionCategory[];

  constructor() { }

  ngOnInit(): void {
  }

  categoryTotal(category: TransactionCategory): number {
      if (!category.id) {
          return this.transactions.filter(transaction => {return !transaction.category_id})
                     .reduce((sum, current) => {
                         return (current.transaction_type == "income") ? (sum + current.value) : (sum - current.value);
                     }, 0)
      }
      return this.transactions.filter(transaction => {return transaction.category_id == category.id})
                 .reduce((sum, current) => {
                     return (current.transaction_type == "income") ? (sum + current.value) : (sum - current.value);
                 }, 0)
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';

import { TransactionCategoryService } from '../services/api-object.service';

@Component({
  selector: 'app-category-totals',
  templateUrl: './category-totals.component.html',
  styleUrls: ['./category-totals.component.css']
})
export class CategoryTotalsComponent implements OnInit {

  @Input()
  transactions: Transaction[];

  @Output()
  updateCategories = new EventEmitter<TransactionCategory[]>();
  @Input()
  get categories(): TransactionCategory[] { return this._categories }
  set categories(categories: TransactionCategory[]) {
      this._categories = categories.concat([]);
      this.displayCategories = [{name: "uncategorized"} as TransactionCategory].concat(categories)
  }
  private _categories: TransactionCategory[];
  displayCategories: TransactionCategory[];

  newCategoryFormControl: FormControl;

  constructor(private transactionCategoryService: TransactionCategoryService) { }

  ngOnInit(): void {
      this.newCategoryFormControl = new FormControl();
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

  addCategory(categoryName: string): void {
      if (!categoryName) return;
      this.transactionCategoryService.addObject({name: categoryName} as TransactionCategory)
          .subscribe(newCategory => {
              this.categories.push(newCategory);
              this.updateCategories.emit(this.categories);
              this.newCategoryFormControl = new FormControl();
          })
  }

}

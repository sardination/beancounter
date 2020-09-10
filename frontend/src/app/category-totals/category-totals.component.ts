import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { faCheck, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';
import { MonthCategory } from '../interfaces/month-category';
import { MonthInfo } from '../interfaces/month-info';

import {
    MonthCategoryService,
    TransactionCategoryService
} from '../services/api-object.service';
import { InfoService } from '../services/info.service';

@Component({
  selector: 'app-category-totals',
  templateUrl: './category-totals.component.html',
  styleUrls: ['./category-totals.component.css']
})
export class CategoryTotalsComponent implements OnInit {

  @Input()
  set selectedMonthInfo(selectedMonthInfo: MonthInfo) { this._selectedMonthInfo = selectedMonthInfo }
  get selectedMonthInfo(): MonthInfo { return this._selectedMonthInfo }
  private _selectedMonthInfo: MonthInfo;
  @Input()
  transactions: Transaction[];

  @Output()
  updateCategories = new EventEmitter<TransactionCategory[]>();
  @Input()
  get categories(): TransactionCategory[] { return this._categories }
  set categories(categories: TransactionCategory[]) {
      this._categories = categories.concat([]);
      this.displayCategories = [{name: "uncategorized"} as TransactionCategory].concat(categories);
      // todo: perhaps sort by total? ...not necessary if using a graph
  }
  private _categories: TransactionCategory[];
  displayCategories: TransactionCategory[];
  realHourlyWage: number;

  newCategoryFormControl: FormControl;

  @Input()
  get monthCategories(): Map<number, MonthCategory> { return this._monthCategories };
  set monthCategories(monthCategories: Map<number, MonthCategory>) {
      this._monthCategories = monthCategories;
  }
  private _monthCategories: Map<number, MonthCategory>; // key: category_id, value: month-category
  fulfilmentTypes = { // font-awesome icon labels
    'positive': faArrowUp,
    'negative': faArrowDown,
    'neutral': faCheck
  }

  constructor(private transactionCategoryService: TransactionCategoryService,
              private monthCategoryService: MonthCategoryService,
              private infoService: InfoService) { }

  ngOnInit(): void {
      this.newCategoryFormControl = new FormControl();
      this.getRealHourlyWage();
  }

  getRealHourlyWage(): void {
      this.infoService.getInfo("real_hourly_wage")
          .subscribe(info => {
              this.realHourlyWage = Number(info.value);
          })
  }

  categoryTotal(category: TransactionCategory): number {
      var useTransactions;
      if (!category.id) {
          useTransactions = this.transactions.filter(transaction => !transaction.category_id);
      } else {
          useTransactions = this.transactions.filter(transaction => transaction.category_id == category.id);
      }
      return useTransactions.reduce((sum, current) => {return sum + current.value}, 0);
      // return useTransactions
      //            .reduce((sum, current) => {
      //                return (current.transaction_type == "income") ? (sum + current.value) : (sum - current.value);
      //            }, 0)
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

  calculateLifeEnergyHours(category: TransactionCategory): number {
      if (this.realHourlyWage == 0) {
          return 0;
      }
      return this.categoryTotal(category) / this.realHourlyWage;
  }

  iconLabelFromCategoryId(categoryId: number): any {
      if (this.monthCategories == undefined) {
        return this.fulfilmentTypes["neutral"];
      }

      let monthCategory = this.monthCategories.get(categoryId)
      if (monthCategory == undefined) {
        return this.fulfilmentTypes["neutral"];
      }

      return this.fulfilmentTypes[monthCategory.fulfilment];
  }

  changeCategoryFulfilment(categoryId: number): void {
      if (categoryId == undefined) return;
      let monthCategory = this.monthCategories.get(categoryId);
      if (monthCategory == undefined) {
          monthCategory = {
              month_info_id: this.selectedMonthInfo.id,
              category_id: categoryId,
              fulfilment: 'neutral'
          } as MonthCategory;
      }

      let fulfilment: 'positive'|'negative'|'neutral' = monthCategory.fulfilment;
      if (fulfilment == 'positive') {
        fulfilment = 'negative';
      } else if (fulfilment == 'negative') {
        fulfilment = 'neutral';
      } else {
        fulfilment = 'positive'
      }
      monthCategory.fulfilment = fulfilment;

      if (monthCategory.id == undefined) {
         // create MonthCategory object
         this.monthCategoryService.addObject(monthCategory)
             .subscribe(newMonthCategory => {
                 this.monthCategories.set(categoryId, newMonthCategory);
             })
      } else {
        // update MonthCategory object
        this.monthCategoryService.updateObject(monthCategory)
            .subscribe(updatedMonthCategory => {
                this.monthCategories.set(categoryId, updatedMonthCategory);
            })
      }
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { faCheck, faArrowUp, faArrowDown, faPlusSquare, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { Transaction } from '../interfaces/transaction';
import { TransactionCategory } from '../interfaces/transaction-category';
import { MonthCategory } from '../interfaces/month-category';
import { MonthInfo } from '../interfaces/month-info';
import { ExchangeRate } from '../interfaces/exchange-rate';

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

  faPlusSquare = faPlusSquare;
  faQuestionCircle = faQuestionCircle;

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
  // realHourlyWage: number;

  newCategoryFormControl: UntypedFormControl;

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

  @Input()
  get exchangeRates(): ExchangeRate[] { return this._exchangeRates };
  set exchangeRates(exchangeRates: ExchangeRate[]) {
    this._exchangeRates = exchangeRates;
    this.exchangeRateMap = new Map<string, number>()
    this._exchangeRates.forEach(exchangeRate => {
      this.exchangeRateMap.set(exchangeRate.currency, exchangeRate.rate)
    })
  }
  private _exchangeRates: ExchangeRate[];
  exchangeRateMap: Map<string, number>;

  constructor(private transactionCategoryService: TransactionCategoryService,
              private monthCategoryService: MonthCategoryService,
              private infoService: InfoService) { }

  ngOnInit(): void {
      this.newCategoryFormControl = new UntypedFormControl();
      // this.getRealHourlyWage();
  }

  // getRealHourlyWage(): void {
  //     this.infoService.getInfo("real_hourly_wage")
  //         .subscribe(info => {
  //             this.realHourlyWage = Number(info.value);
  //         })
  // }

  categoryTotalInaccurate(category: TransactionCategory): boolean {
    // Return true if we have calculated a total excluding values due to an unset exchange rate
    var useTransactions;
    if (!category.id) {
        useTransactions = this.transactions.filter(transaction => !transaction.category_id);
    } else {
        useTransactions = this.transactions.filter(transaction => transaction.category_id == category.id);
    }
    for (var i = 0; i < useTransactions.length; i++) {
      var transaction = useTransactions[i]
      if (transaction.currency != "USD" && !this.exchangeRateMap.get(transaction.currency)) return true;
    }
    return false
  }

  categoryTotal(category: TransactionCategory): number {
      var useTransactions;
      if (!category.id) {
          useTransactions = this.transactions.filter(transaction => !transaction.category_id);
      } else {
          useTransactions = this.transactions.filter(transaction => transaction.category_id == category.id);
      }
      return useTransactions.reduce(
        (sum, current) => {
          let rate = this.exchangeRateMap.get(current.currency);
          if (!rate) return sum; // Don't add the value if the currency is not set
          return sum + current.value / rate
        },
        0
      );
  }

  addCategory(categoryName: string): void {
      if (!categoryName) return;
      this.transactionCategoryService.addObject({name: categoryName} as TransactionCategory)
          .subscribe(newCategory => {
              this.categories.push(newCategory);
              this.updateCategories.emit(this.categories);
              this.newCategoryFormControl = new UntypedFormControl();
          })
  }

  calculateLifeEnergyHours(category: TransactionCategory): number {
      if (this.selectedMonthInfo == undefined) return 0;
      let realHourlyWage = this.selectedMonthInfo.real_hourly_wage;
      if (realHourlyWage == 0) return 0;
      return this.categoryTotal(category) / realHourlyWage;
  }

  iconClassFromCategoryId(categoryId: number): any {
      if (this.monthCategories == undefined) {
        return "neutral";
      }

      let monthCategory = this.monthCategories.get(categoryId)
      if (monthCategory == undefined) {
        return "neutral";
      }

      return monthCategory.fulfilment;
  }

  iconLabelFromCategoryId(categoryId: number): any {
      return this.fulfilmentTypes[this.iconClassFromCategoryId(categoryId)];
  }

  changeCategoryFulfilment(categoryId: number): void {
      if (categoryId == undefined) return;
      if (this.selectedMonthInfo != undefined && this.selectedMonthInfo.completed) return;
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

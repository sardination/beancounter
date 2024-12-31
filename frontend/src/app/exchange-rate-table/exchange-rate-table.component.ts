import { Component, OnInit, Input } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl } from '@angular/forms';
import { faEdit, faCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { ExchangeRate } from '../interfaces/exchange-rate'
import { ExchangeRateService } from '../services/api-object.service'

@Component({
  selector: 'app-exchange-rate-table',
  templateUrl: './exchange-rate-table.component.html',
  styleUrls: ['./exchange-rate-table.component.css']
})
export class ExchangeRateTableComponent implements OnInit {

  faEdit = faEdit;
  faCheck = faCheck;
  faQuestionCircle = faQuestionCircle;

  @Input()
  get currencies(): string[] { return this._currencies };
  set currencies(currencies: string[]) {
    this._currencies = currencies;
    this.fillMap();
    if (!this.tableDataSource) {
      this.tableDataSource = new MatTableDataSource<string>(this._currencies)
    } else {
      this.tableDataSource.data = this._currencies;
    }
  }
  private _currencies: string[];

  @Input()
  get exchangeRates(): ExchangeRate[] { return this._exchangeRates };
  set exchangeRates(exchangeRates: ExchangeRate[]) {
    this._exchangeRates = exchangeRates;
    this.fillMap();
  }
  private _exchangeRates: ExchangeRate[];

  @Input()
  get monthInfoId(): number { return this._monthInfoId };
  set monthInfoId(monthInfoId: number) {
      this.cancelEditCurrencyEntry();
      this._monthInfoId = monthInfoId;
      this.fillMap()
  }
  private _monthInfoId: number;

  currencyToExchangeRateMap: Map<string, ExchangeRate> = new Map<string, ExchangeRate>();
  editingCurrency: string;

  tableDataSource: MatTableDataSource<string>;
  columnsToDisplay = ['usd', 'other_currency', 'edit'];

  editingRate: UntypedFormControl;

  constructor(
    private exchangeRateService: ExchangeRateService,
  ) { }

  ngOnInit(): void { }

  fillMap(): void {
      if (this.exchangeRates == undefined || this.currencies == undefined || this.monthInfoId == undefined) {
        return;
      }

      this.currencies.forEach(
        currency => {
          this.currencyToExchangeRateMap.set(
            currency, {
              currency: currency,
              rate: 0,
              month_info_id: this.monthInfoId
            } as ExchangeRate
          );
        }
      )

      this.exchangeRates.forEach(
        exchangeRate => {
          this.currencyToExchangeRateMap.set(exchangeRate.currency, exchangeRate);
        }
      )
  }

  exchangeRateFromCurrency(currency: string): ExchangeRate {
    let exchangeRate = this.currencyToExchangeRateMap.get(currency);
    if (exchangeRate == undefined) {
      exchangeRate = {
        currency: currency,
        rate: 0,
        month_info_id: this.monthInfoId
      } as ExchangeRate;
    }
    return exchangeRate;
  }

  selectEditingCurrency(editingCurrency: string): void {
    this.setFormControls(this.exchangeRateFromCurrency(editingCurrency));
    this.tableDataSource.data = this.currencies;
    this.editingCurrency = editingCurrency;
  }

  zeroFormControls(): void {
    this.editingRate = new UntypedFormControl(0);
  }

  setFormControls(exchangeRate: ExchangeRate): void {
    this.editingRate = new UntypedFormControl(exchangeRate.rate);
  }

  cancelEditCurrencyEntry(): void {
    if (this.tableDataSource) {
        this.tableDataSource.data = this.currencies;
    }
    this.editingCurrency = null;
  }

  validateFormControls(): boolean {
    let valid = true;

    if (this.editingRate.value == undefined) {
      this.editingRate.setErrors({'incorrect': true});
      valid = false;
    } else {
      this.editingRate.setErrors(null);
    }

    return valid;
  }

  updateEditingCurrency(): void {
      if (!this.validateFormControls()) return;

      this.tableDataSource.data = this.currencies;
      this.updateEditingExchangeRateFromFormControls();
      var exchangeRate = this.exchangeRateFromCurrency(this.editingCurrency);

      console.log(exchangeRate)

      if (!exchangeRate.id) {
        this.exchangeRateService.addObject(exchangeRate)
            .subscribe(newExchangeRate => {
                this.exchangeRates.push(newExchangeRate);
                this.exchangeRates = this.exchangeRates;
                this.tableDataSource.data = this.currencies;
                this.editingCurrency = null;
            })
      } else {
        this.exchangeRateService.updateObject(exchangeRate)
            .subscribe(updatedExchangeRate => {
                Object.assign(exchangeRate, updatedExchangeRate);
                this.exchangeRates = this.exchangeRates;
                this.tableDataSource.data = this.currencies;
                this.editingCurrency = null;
            })
      }

      this.currencyToExchangeRateMap.set(this.editingCurrency, exchangeRate);
  }

  updateEditingExchangeRateFromFormControls(): void {
    let editingExchangeRate = this.exchangeRateFromCurrency(this.editingCurrency);
    if (editingExchangeRate != undefined) {
      editingExchangeRate.rate = this.editingRate.value;
      this.currencyToExchangeRateMap.set(this.editingCurrency, editingExchangeRate);
    }
  }

}

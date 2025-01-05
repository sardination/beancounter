import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { getCurrencySymbol, currencyIncluded, includedCurrencies } from '../../currency/utils'

@Component({
  selector: 'app-currency-selector',
  templateUrl: './currency-selector.component.html',
  styleUrls: ['./currency-selector.component.css']
})
export class CurrencySelectorComponent implements OnInit {

  getCurrencySymbol = getCurrencySymbol
  currencyIncluded = currencyIncluded
  includedCurrencies = includedCurrencies

  @Input() useFormControl: UntypedFormControl

  constructor() { }

  ngOnInit(): void {
  }

}

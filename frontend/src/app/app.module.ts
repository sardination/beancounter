import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { WageCalculatorComponent } from './wage-calculator/wage-calculator.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { AppRoutingModule } from './app-routing.module';
import { StepOneComponent } from './steps/step-one/step-one.component';
import { PriorIncomeComponent } from './prior-income/prior-income.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { PriorIncomeTableComponent } from './prior-income/prior-income-table/prior-income-table.component';

@NgModule({
  declarations: [
    AppComponent,
    WageCalculatorComponent,
    TransactionsComponent,
    TransactionDetailComponent,
    StepOneComponent,
    PriorIncomeComponent,
    BalanceSheetComponent,
    PriorIncomeTableComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatTabsModule,
    FlexLayoutModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { WageCalculatorComponent } from './wage-calculator/wage-calculator.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { AppRoutingModule } from './app-routing.module';
import { StepOneComponent } from './steps/step-one/step-one.component';
import { PriorIncomeComponent } from './prior-income/prior-income.component';
import { AddEntryDialog, BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { PriorIncomeTableComponent } from './prior-income/prior-income-table/prior-income-table.component';
import { BalanceSheetEntryTableComponent } from './balance-sheet/balance-sheet-entry-table/balance-sheet-entry-table.component';

@NgModule({
  declarations: [
    AppComponent,
    WageCalculatorComponent,
    TransactionsComponent,
    TransactionDetailComponent,
    StepOneComponent,
    PriorIncomeComponent,
    BalanceSheetComponent,
    AddEntryDialog,
    PriorIncomeTableComponent,
    BalanceSheetEntryTableComponent
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    FlexLayoutModule,
  ],
  entryComponents: [
    AddEntryDialog,
  ],
  providers: [{provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
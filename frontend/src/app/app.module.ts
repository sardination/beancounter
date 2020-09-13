import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StepOneComponent } from './steps/step-one/step-one.component';
import { PriorIncomeComponent } from './prior-income/prior-income.component';
import { AddEntryDialog, BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { PriorIncomeTableComponent } from './prior-income/prior-income-table/prior-income-table.component';
import { BalanceSheetEntryTableComponent } from './balance-sheet/balance-sheet-entry-table/balance-sheet-entry-table.component';
import { StepTwoComponent } from './steps/step-two/step-two.component';
import { AddJobTransactionDialog, RealWageComponent } from './real-wage/real-wage.component';
import { JobTransactionTableComponent } from './real-wage/job-transaction-table/job-transaction-table.component';
import { DailyTransactionsComponent } from './daily-transactions/daily-transactions.component';
import { DailyTransactionTableComponent } from './daily-transactions/daily-transaction-table/daily-transaction-table.component';
import { StepThreeComponent } from './steps/step-three/step-three.component';
import { MonthlyTabulationComponent } from './monthly-tabulation/monthly-tabulation.component';
import { CategoryTotalsComponent } from './category-totals/category-totals.component';
import { StepFiveComponent } from './steps/step-five/step-five.component';
import { MonthlyFlowChartComponent } from './monthly-flow-chart/monthly-flow-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    StepOneComponent,
    PriorIncomeComponent,
    BalanceSheetComponent,
    AddEntryDialog,
    PriorIncomeTableComponent,
    BalanceSheetEntryTableComponent,
    StepTwoComponent,
    RealWageComponent,
    JobTransactionTableComponent,
    AddJobTransactionDialog,
    DailyTransactionsComponent,
    DailyTransactionTableComponent,
    StepThreeComponent,
    MonthlyTabulationComponent,
    CategoryTotalsComponent,
    StepFiveComponent,
    MonthlyFlowChartComponent
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
    MatSidenavModule,
    MatListModule,
    FlexLayoutModule,
    FontAwesomeModule,
  ],
  entryComponents: [
    AddEntryDialog,
  ],
  providers: [{provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}],
  bootstrap: [AppComponent]
})
export class AppModule { }

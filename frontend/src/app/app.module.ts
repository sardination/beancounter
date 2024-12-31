import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MomentDateModule, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';
import { PriorIncomeComponent } from './prior-income/prior-income.component';
import { AddEntryDialog, BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { PriorIncomeTableComponent } from './prior-income/prior-income-table/prior-income-table.component';
import { BalanceSheetEntryTableComponent } from './balance-sheet/balance-sheet-entry-table/balance-sheet-entry-table.component';
import { AddJobTransactionDialog, RealWageComponent } from './real-wage/real-wage.component';
import { JobTransactionTableComponent } from './real-wage/job-transaction-table/job-transaction-table.component';
import { DailyTransactionsComponent } from './daily-transactions/daily-transactions.component';
import { DailyTransactionTableComponent } from './daily-transactions/daily-transaction-table/daily-transaction-table.component';
import { MonthlyTabulationComponent } from './monthly-tabulation/monthly-tabulation.component';
import { CategoryTotalsComponent } from './category-totals/category-totals.component';
import { MonthlyFlowChartComponent } from './monthly-flow-chart/monthly-flow-chart.component';
import { MonthlyReflectionComponent } from './monthly-reflection/monthly-reflection.component';
import { InvestmentIncomeTableComponent } from './investment-income-table/investment-income-table.component';
import { MonthlyAssetAccountTableComponent } from './monthly-asset-account-table/monthly-asset-account-table.component';
import { AddAssetAccountDialog, NetWorthComponent } from './net-worth/net-worth.component';
import { NetWorthChartComponent } from './net-worth-chart/net-worth-chart.component';
import { AssetAccountTableComponent } from './net-worth/asset-account-table/asset-account-table.component';
import { PriorInventoryPageComponent } from './pages/prior-inventory-page/prior-inventory-page.component';
import { CurrentJobPageComponent } from './pages/current-job-page/current-job-page.component';
import { DailyTransactionsPageComponent } from './pages/daily-transactions-page/daily-transactions-page.component';
import { MonthlyReviewPageComponent } from './pages/monthly-review-page/monthly-review-page.component';
import { FIProjectionPageComponent } from './pages/fi-projection-page/fi-projection-page.component';
import { NetWorthPageComponent } from './pages/net-worth-page/net-worth-page.component';
import { PageDirective } from './pages/page.directive';
import { CurrencySelectorComponent } from './currency/currency-selector/currency-selector.component';
import { ExchangeRateTableComponent } from './exchange-rate-table/exchange-rate-table.component';

@NgModule({
    declarations: [
        AppComponent,
        PriorIncomeComponent,
        BalanceSheetComponent,
        AddEntryDialog,
        PriorIncomeTableComponent,
        BalanceSheetEntryTableComponent,
        RealWageComponent,
        JobTransactionTableComponent,
        AddJobTransactionDialog,
        DailyTransactionsComponent,
        DailyTransactionTableComponent,
        MonthlyTabulationComponent,
        CategoryTotalsComponent,
        MonthlyFlowChartComponent,
        MonthlyReflectionComponent,
        InvestmentIncomeTableComponent,
        MonthlyAssetAccountTableComponent,
        NetWorthComponent,
        NetWorthChartComponent,
        AddAssetAccountDialog,
        AssetAccountTableComponent,
        PriorInventoryPageComponent,
        CurrentJobPageComponent,
        DailyTransactionsPageComponent,
        MonthlyReviewPageComponent,
        FIProjectionPageComponent,
        NetWorthPageComponent,
        PageDirective,
        CurrencySelectorComponent,
        ExchangeRateTableComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        // AppRoutingModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatTabsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDividerModule,
        MatSidenavModule,
        MatPaginatorModule,
        MatListModule,
        MatTooltipModule,
        MatDatepickerModule,
        MomentDateModule,
        FlexLayoutModule,
        FontAwesomeModule,
    ],
    providers: [
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

// make sure it is known that pywebview is a property of Window
declare global {
    interface Window {
        pywebview: any;
    }
}

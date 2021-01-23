import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PriorInventoryPageComponent } from './pages/prior-inventory-page/prior-inventory-page.component';
import { CurrentJobPageComponent } from './pages/current-job-page/current-job-page.component';
import { DailyTransactionsPageComponent } from './pages/daily-transactions-page/daily-transactions-page.component';
import { MonthlyReviewPageComponent } from './pages/monthly-review-page/monthly-review-page.component';
import { NetWorthPageComponent } from './pages/net-worth-page/net-worth-page.component';
import { FIProjectionPageComponent } from './pages/fi-projection-page/fi-projection-page.component';


// const routes: Routes = [
//     {path: '', redirectTo: '/daily-transactions', pathMatch: 'full'},
//     {path: 'prior-inventory', component: PriorInventoryPageComponent},
//     {path: 'current-job', component: CurrentJobPageComponent},
//     {path: 'daily-transactions', component: DailyTransactionsPageComponent},
//     {path: 'monthly-review', component: MonthlyReviewPageComponent},
//     {path: 'net-worth', component: NetWorthPageComponent},
//     {path: 'fi-projection', component: FIProjectionPageComponent},
// ];


@NgModule({
  declarations: [],
  imports: [],
  exports: []
  // imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  // exports: [RouterModule]
})
export class AppRoutingModule { }

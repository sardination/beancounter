import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PriorInventoryPageComponent } from './pages/prior-inventory-page/prior-inventory-page.component';
import { CurrentJobPageComponent } from './pages/current-job-page/current-job-page.component';
import { DailyTransactionsPageComponent } from './pages/daily-transactions-page/daily-transactions-page.component';
import { StepFiveComponent } from './steps/step-five/step-five.component';
import { NetWorthComponent } from './steps/net-worth/net-worth.component';


const routes: Routes = [
    {path: '', redirectTo: '/daily-transactions', pathMatch: 'full'},
    {path: 'prior-inventory', component: PriorInventoryPageComponent},
    {path: 'current-job', component: CurrentJobPageComponent},
    {path: 'daily-transactions', component: DailyTransactionsPageComponent},
    {path: 'step5', component: StepFiveComponent},
    {path: 'net-worth', component: NetWorthComponent},
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

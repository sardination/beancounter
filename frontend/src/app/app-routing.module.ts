import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TransactionsComponent } from './transactions/transactions.component';
import { WageCalculatorComponent } from './wage-calculator/wage-calculator.component';
import { StepOneComponent } from './steps/step-one/step-one.component';


const routes: Routes = [
    {path: '', redirectTo: '/step1', pathMatch: 'full'},
    {path: 'step1', component: StepOneComponent},
    // {path: '', redirectTo: '/transactions', pathMatch: 'full'},
    {path: 'transactions', component: TransactionsComponent},
    {path: 'wage-calculator', component: WageCalculatorComponent},
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

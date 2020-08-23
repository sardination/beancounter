import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StepOneComponent } from './steps/step-one/step-one.component';
import { StepTwoComponent } from './steps/step-two/step-two.component';


const routes: Routes = [
    {path: '', redirectTo: '/step1', pathMatch: 'full'},
    {path: 'step1', component: StepOneComponent},
    {path: 'step2', component: StepTwoComponent},
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

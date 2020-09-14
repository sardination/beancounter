import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StepOneComponent } from './steps/step-one/step-one.component';
import { StepTwoComponent } from './steps/step-two/step-two.component';
import { StepThreeComponent } from './steps/step-three/step-three.component';
import { StepFiveComponent } from './steps/step-five/step-five.component';


const routes: Routes = [
    {path: '', redirectTo: '/step1', pathMatch: 'full'},
    {path: 'step1', component: StepOneComponent},
    {path: 'step2', component: StepTwoComponent},
    {path: 'step3', component: StepThreeComponent},
    {path: 'step5', component: StepFiveComponent},
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

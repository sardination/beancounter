import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PriorInventoryComponent } from './pages/prior-inventory/prior-inventory.component';
import { StepTwoComponent } from './steps/step-two/step-two.component';
import { StepThreeComponent } from './steps/step-three/step-three.component';
import { StepFiveComponent } from './steps/step-five/step-five.component';
import { NetWorthComponent } from './steps/net-worth/net-worth.component';


const routes: Routes = [
    {path: '', redirectTo: '/step3', pathMatch: 'full'},
    {path: 'prior-inventory', component: PriorInventoryComponent},
    {path: 'step2', component: StepTwoComponent},
    {path: 'step3', component: StepThreeComponent},
    {path: 'step5', component: StepFiveComponent},
    {path: 'net-worth', component: NetWorthComponent},
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainScreenComponent } from './views/main-screen/main-screen.component';
import { AddPaymentComponent } from './views/add-payment/add-payment.component';
import { EditPaymentComponent } from './views/edit-payment/edit-payment.component';

const routes: Routes = [
  { path: '', component: MainScreenComponent },
  { path: 'add-payment', component: AddPaymentComponent },
  { path: 'edit-payment/:id', component: EditPaymentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

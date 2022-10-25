import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RetornoArPage } from './retorno-ar.page';

const routes: Routes = [
  {
    path: '',
    component: RetornoArPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RetornoArPageRoutingModule {}

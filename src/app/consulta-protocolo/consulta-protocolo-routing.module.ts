import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultaProtocoloPage } from './consulta-protocolo.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultaProtocoloPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultaProtocoloPageRoutingModule {}

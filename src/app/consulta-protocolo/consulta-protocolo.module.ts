import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsultaProtocoloPageRoutingModule } from './consulta-protocolo-routing.module';

import { ConsultaProtocoloPage } from './consulta-protocolo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultaProtocoloPageRoutingModule
  ],
  declarations: [ConsultaProtocoloPage]
})
export class ConsultaProtocoloPageModule {}

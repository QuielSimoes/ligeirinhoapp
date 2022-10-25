import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RetornoArPageRoutingModule } from './retorno-ar-routing.module';

import { RetornoArPage } from './retorno-ar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RetornoArPageRoutingModule
  ],
  declarations: [RetornoArPage]
})
export class RetornoArPageModule {}

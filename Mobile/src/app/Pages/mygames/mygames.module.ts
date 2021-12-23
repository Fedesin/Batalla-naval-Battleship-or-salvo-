import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MygamesPageRoutingModule } from './mygames-routing.module';

import { MygamesPage } from './mygames.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MygamesPageRoutingModule
  ],
  declarations: [MygamesPage]
})
export class MygamesPageModule {}

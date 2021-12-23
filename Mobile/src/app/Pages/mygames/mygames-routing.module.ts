import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MygamesPage } from './mygames.page';

const routes: Routes = [
  {
    path: '',
    component: MygamesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MygamesPageRoutingModule {}

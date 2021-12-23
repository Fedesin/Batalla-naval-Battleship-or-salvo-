import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../home/home.module').then((h) => h.HomePageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.module').then((p) => p.ProfilePageModule),
      },
      {
        path: 'mygames',
        loadChildren: () =>
          import('../mygames/mygames.module').then((g) => g.MygamesPageModule),
      },
      {
        path: 'ranking',
        loadChildren: () =>
          import('../ranking/ranking.module').then((r) => r.RankingPageModule),
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}

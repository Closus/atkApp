import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'bottom-sheet-filter',
    loadComponent: () => import('./pages/bottom-sheet-filter/bottom-sheet-filter.page').then( m => m.BottomSheetFilterPage)
  }
];

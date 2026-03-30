import { Routes } from '@angular/router';

export const PrescriptionRoutes: Routes = [
  {
    path: '',
    redirectTo: 'recetas',
    pathMatch: 'full',
  },
  {
    path: 'recetas',
    loadComponent: () =>
      import('./recetas/recetas.component').then(m => m.RecetasComponent),
  },
  {
    path: 'dispensacion',
    loadComponent: () =>
      import('./dispensacion/dispensacion.component').then(m => m.DispensacionComponent),
  },
  {
    path: 'kardex',
    loadComponent: () =>
      import('./kardex/kardex.component').then(m => m.KardexComponent),
  },
];
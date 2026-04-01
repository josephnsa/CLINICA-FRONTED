import { Routes } from '@angular/router';

export const ATENCION_CLIENTE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'reclamos',
    pathMatch: 'full',
  },
  {
    path: 'reclamos',
    loadComponent: () =>
      import('./reclamos/reclamos.component').then(m => m.ReclamosComponent),
  },
  {
    path: 'encuestas',
    loadComponent: () =>
      import('./encuestas/encuestas.component').then(m => m.EncuestasComponent),
  },
];
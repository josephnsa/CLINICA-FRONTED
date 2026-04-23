import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: 'busqueda',
    loadComponent: () =>
      import('./busqueda/busqueda.component').then(m => m.BusquedaComponent),
  },
  {
    path: 'reserva',
    loadComponent: () =>
      import('./reserva/reserva.component').then(m => m.ReservaComponent),
  },
  {
    path: 'confirmaciones',
    loadComponent: () =>
      import('./confirmaciones/confirmaciones.component').then(m => m.ConfirmacionesComponent),
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./pagos/pagos.component').then(m => m.PagosComponent),
  },
];
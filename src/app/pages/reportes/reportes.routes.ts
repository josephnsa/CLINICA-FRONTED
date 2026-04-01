import { Routes } from '@angular/router';

export const ReportesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'operativos',
    pathMatch: 'full',
  },
  {
    path: 'operativos',
    loadComponent: () =>
      import('./operativos/operativos.component').then(m => m.OperativosComponent),
  },
  {
    path: 'clinicos',
    loadComponent: () =>
      import('./clinicos/clinicos.component').then(m => m.ClinicosComponent),
  },
  {
    path: 'financieros',
    loadComponent: () =>
      import('./financieros/financieros.component').then(m => m.FinancierosComponent),
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./inventario/inventario.component').then(m => m.InventarioReporteComponent),
  },
];
import { Routes } from '@angular/router';
import { ControlStockComponent } from './control-stock/control-stock.component';
import { LotesComponent } from './lotes/lotes.component';
import { ComprasComponent } from './compras/compras.component';
import { AlertasComponent } from './alertas/alertas.component';

export const InventarioRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'control-stock', component: ControlStockComponent },
      { path: 'stock', component: ControlStockComponent },
      { path: 'lotes', component: LotesComponent },
      { path: 'gestion-lotes', component: LotesComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'proveedores', component: ComprasComponent },
      { path: 'alertas', component: AlertasComponent },
      { path: 'alertas-stock', component: AlertasComponent },
      { path: '', pathMatch: 'full', redirectTo: 'control-stock' },
    ],
  },
];
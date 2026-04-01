import { Routes } from '@angular/router';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { FirmaComponent } from './firma/firma.component';

export const ExamenesRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'ordenes', component: OrdenesComponent },
      { path: 'seguimiento', component: SeguimientoComponent },
      { path: 'estado', component: SeguimientoComponent },
      { path: 'resultados', component: ResultadosComponent },
      { path: 'firma', component: FirmaComponent },
      { path: 'validacion', component: FirmaComponent },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'ordenes',
      },
    ],
  },
];
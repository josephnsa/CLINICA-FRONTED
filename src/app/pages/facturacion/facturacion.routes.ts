import { Routes } from '@angular/router';

import { FacturacionProformasComponent } from './proformas/facturacion-proformas.component';
import { FacturacionEmitirComponent } from './emitir/facturacion-emitir.component';
import { FacturacionPagosComponent } from './pagos/facturacion-pagos.component';
import { FacturacionPagoComponent } from './pago/facturacion-pago.component';
import { FacturacionNotasCreditoComponent } from './notas-credito/facturacion-notas-credito.component';
import { FacturacionCajaComponent } from './caja/facturacion-caja.component';

export const FacturacionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'proformas',
        component: FacturacionProformasComponent,
      },
      {
        path: 'comprobantes',
        component: FacturacionEmitirComponent,
      },
      {
        path: 'pagos',
        component: FacturacionPagosComponent,
      },
      {
        path: 'pagos/:id',
        component: FacturacionPagoComponent,
      },
      {
        path: 'notas-credito',
        component: FacturacionNotasCreditoComponent,
      },
      {
        path: 'cierre-caja',
        component: FacturacionCajaComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'comprobantes',
      },
    ],
  },
];

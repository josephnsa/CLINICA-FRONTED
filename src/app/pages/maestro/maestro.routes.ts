import { Routes } from '@angular/router';

import { MaestroServiciosComponent } from './servicios/maestro-servicios.component';
import { MaestroEspecialistasComponent } from './especialistas/maestro-especialistas.component';
import { MaestroCie10Component } from './cie10/maestro-cie10.component';
import { MaestroMedicamentosComponent } from './medicamentos/maestro-medicamentos.component';
import { MaestroTarifariosComponent } from './tarifarios/maestro-tarifarios.component';
import { MaestroDashboardClinicoComponent } from './dashboard-clinico/maestro-dashboard-clinico.component';

export const MaestroRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'servicios',
        component: MaestroServiciosComponent,
      },
      {
        path: 'especialistas',
        component: MaestroEspecialistasComponent,
      },
      {
        path: 'cie10',
        component: MaestroCie10Component,
      },
      {
        path: 'medicamentos',
        component: MaestroMedicamentosComponent,
      },
      {
        path: 'tarifarios',
        component: MaestroTarifariosComponent,
      },
      {
        path: 'dashboard-clinico',
        component: MaestroDashboardClinicoComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard-clinico',
      },
    ],
  },
];


import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/authentication/login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'maestro',
        loadChildren: () =>
          import('./pages/maestro/maestro.routes').then((m) => m.MaestroRoutes),
      },
      {
        path: 'facturacion',
        loadChildren: () =>
          import('./pages/facturacion/facturacion.routes').then(
            (m) => m.FacturacionRoutes
          ),
      },
      {
        path: 'seguridad',
        loadChildren: () =>
          import('./pages/seguridad/seguridad.routes').then(
            (m) => m.SeguridadRoutes
          ),
      },
      {
        path: 'pacientes',
        loadChildren: () =>
          import('./pages/pacientes/pacientes.routes').then(
            (m) => m.PacientesRoutes
          ),
      },
      {
        path: 'prescripciones',
        loadChildren: () =>
          import('./pages/prescription/prescription.routes').then(
            (m) => m.PrescriptionRoutes
          ),
      },
      {
        path: 'agenda',
        loadChildren: () =>
          import('./pages/agenda/agenda.routes').then(
            (m) => m.AgendaRoutes
          ),
      },
      {
  path: 'examenes',
  loadChildren: () =>
    import('./pages/examenes/examenes.routes').then(
      (m) => m.ExamenesRoutes
    ),
},
{
  path: 'inventario',
  loadChildren: () =>
    import('./pages/inventario/inventario.routes').then(
      (m) => m.InventarioRoutes
    ),
},
{
  path: 'reportes',
  loadChildren: () =>
    import('./pages/reportes/reportes.routes').then(m => m.ReportesRoutes),
},
{
  path: 'rrhh',
  loadChildren: () => import('./pages/hrm/hrm.routes').then(m => m.HRM_ROUTES),
},
{
  path: 'atencion-cliente',
  loadChildren: () =>
    import('./pages/atencion-cliente/atencion-cliente.routes')
      .then(m => m.ATENCION_CLIENTE_ROUTES),
},
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
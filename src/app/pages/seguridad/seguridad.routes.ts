import { Routes } from '@angular/router';

import { SeguridadUsuariosComponent } from './usuarios/seguridad-usuarios.component';
import { SeguridadAutenticacionComponent } from './autenticacion/seguridad-autenticacion.component';
import { SeguridadAuditoriaComponent } from './auditoria/seguridad-auditoria.component';
import { SeguridadParametrosSedeComponent } from './parametros-sede/seguridad-parametros-sede.component';

export const SeguridadRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'usuarios',
        component: SeguridadUsuariosComponent,
      },
      {
        path: 'autenticacion',
        component: SeguridadAutenticacionComponent,
      },
      {
        path: 'auditoria',
        component: SeguridadAuditoriaComponent,
      },
      {
        path: 'parametros-sede',
        component: SeguridadParametrosSedeComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'usuarios',
      },
    ],
  },
];


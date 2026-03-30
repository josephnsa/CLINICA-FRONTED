import { Routes } from '@angular/router';
import { PacientesRegistroComponent } from './registro/pacientes-registro.component';
import { PacientesConsentimientosComponent } from './consentimientos/pacientes-consentimientos.component';
import { PacientesFichaClinicaComponent } from './ficha-clinica/pacientes-ficha-clinica.component';
import { PacientesEvolucionesComponent } from './evoluciones/pacientes-evoluciones.component';

export const PacientesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'registro',
        component: PacientesRegistroComponent,
      },
      {
        path: 'consentimientos',
        component: PacientesConsentimientosComponent,
      },
      {
        path: 'ficha-clinica',
        component: PacientesFichaClinicaComponent,
      },
      {
        path: 'evoluciones',
        component: PacientesEvolucionesComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'registro',
      },
    ],
  },
];
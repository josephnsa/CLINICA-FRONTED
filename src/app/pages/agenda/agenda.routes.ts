import { Routes } from '@angular/router';
import { CalendariosComponent } from './calendarios/calendarios.component';
import { DisponibilidadComponent } from './disponibilidad/disponibilidad.component';
import { CitasComponent } from './citas/citas.component';
import { AdmisionComponent } from './admision/admision.component';
import { TriajeComponent } from './triaje/triaje.component';
import { ConsultaComponent } from './consulta/consulta.component';

export const AgendaRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'calendarios',
        component: CalendariosComponent,
      },
      {
        path: 'disponibilidad',
        component: DisponibilidadComponent,
      },
      {
        path: 'citas',
        component: CitasComponent,
      },
      {
        path: 'admision',
        component: AdmisionComponent,
      },
      {
        path: 'triaje',
        component: TriajeComponent,
      },
      {
        path: 'consulta',
        component: ConsultaComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'calendarios',
      },
    ],
  },
];
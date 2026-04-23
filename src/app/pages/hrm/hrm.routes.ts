import { Routes } from '@angular/router';

export const HRM_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'empleados',
    pathMatch: 'full',
  },
  {
    path: 'empleados',
    loadComponent: () =>
      import('./empleados/empleados.component').then(m => m.EmpleadosComponent),
    title: 'Ficha de empleado',
  },
  {
    path: 'horarios',
    loadComponent: () =>
      import('./horarios/horarios.component').then(m => m.HorariosComponent),
    title: 'Horarios y guardias',
  },
  {
    path: 'asistencia',
    loadComponent: () =>
      import('./asistencia/asistencia.component').then(m => m.AsistenciaComponent),
    title: 'Control de asistencia',
  },
  {
    path: 'productividad',
    loadComponent: () =>
      import('./productividad/productividad.component').then(m => m.ProductividadComponent),
    title: 'Productividad',
  },
];
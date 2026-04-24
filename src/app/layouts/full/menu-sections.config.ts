import { NavItem } from './sidebar/nav-item/nav-item';

/**
 * Secciones del menú lateral. Las etiquetas de `groupLabels` deben coincidir
 * exactamente con el `label` del grupo raíz que devuelve el API (`/auth/menu`).
 */
export interface MenuSectionConfig {
  title: string;
  /** Grupos del backend en el orden deseado dentro de la sección */
  groupLabels: string[];
  /** Enlaces que no vienen como grupo del API (ej. Dashboard) */
  extraItems?: NavItem[];
}

export const MENU_SECTION_LAYOUT: MenuSectionConfig[] = [
  {
    title: 'GENERAL',
    extraItems: [
      {
        displayName: 'Dashboard',
        iconName: 'tabler:layout-dashboard',
        route: 'dashboard',
      },
    ],
    groupLabels: ['Reportes y Analítica'],
  },
  {
    title: 'PACIENTES',
    groupLabels: [
      'Pacientes e Historia Clínica',
      'Agenda, Disponibilidad y Atención',
      'Portal del Paciente',
      'Prescripción y Medicación',
      'Exámenes y Resultados',
      'Facturación y Caja',
    ],
  },
  {
    title: 'CLINIC MASTERS',
    groupLabels: [
      'Maestro Clínico',
      'Inventario y Farmacia',
      'RR.HH. y Empleados',
    ],
  },
  {
    title: 'CONFIGURACIÓN',
    groupLabels: ['Seguridad y Accesos', 'Configuración e Integraciones'],
  },
  {
    title: 'SOPORTE / OPERACIÓN',
    groupLabels: ['Atención al Cliente'],
  },
];

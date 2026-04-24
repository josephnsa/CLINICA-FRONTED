/** Normaliza rutas del menú del API a paths del router Angular. */
export function normalizeMenuRoute(route?: string | null): string | null {
  if (!route) return null;
  const cleanRoute = route.replace(/^\/+/, '');

  const aliases: Record<string, string> = {
    'atencion/reclamos': 'atencion-cliente/reclamos',
    'atencion/encuestas': 'atencion-cliente/encuestas',
    'seleccion/reclamos': 'atencion-cliente/reclamos',
    'seleccion/encuestas': 'atencion-cliente/encuestas',
    'seguimiento/reclamos': 'atencion-cliente/reclamos',
    'seguimiento/encuestas': 'atencion-cliente/encuestas',
    'hrm/empleados': 'rrhh/empleados',
    'hrm/horarios': 'rrhh/horarios',
    'hrm/asistencia': 'rrhh/asistencia',
    'hrm/productividad': 'rrhh/productividad',
  };

  return aliases[cleanRoute] ?? cleanRoute;
}

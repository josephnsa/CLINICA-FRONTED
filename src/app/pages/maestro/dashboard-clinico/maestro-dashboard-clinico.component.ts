import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { NgApexchartsModule } from 'ng-apexcharts';

/** Fila de cita reciente (conectar API cuando exista endpoint). */
export interface DashboardCitaRow {
  hora: string;
  paciente: string;
  especialista: string;
  estado: string;
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: string;
  variant: string;
  trend: string;
  trendType: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'app-maestro-dashboard-clinico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    DatePickerFieldComponent,
    NgApexchartsModule,
    RouterLink,
  ],
  templateUrl: './maestro-dashboard-clinico.component.html',
  styleUrl: './maestro-dashboard-clinico.component.scss',
})
export class MaestroDashboardClinicoComponent {
  readonly dashboardDate = new FormControl<Date | null>(new Date());

  readonly displayedColumns: (keyof DashboardCitaRow)[] = ['hora', 'paciente', 'especialista', 'estado'];

  /** Vista previa UI; sustituir por datos reales del backend. */
  readonly recentCitas: DashboardCitaRow[] = [
    { hora: '08:30', paciente: 'María Rojas V.', especialista: 'Dra. Ana Méndez', estado: 'ATENDIDA' },
    { hora: '09:15', paciente: 'Carlos Pérez L.', especialista: 'Dr. Luis Ortega', estado: 'EN_CONSULTA' },
    { hora: '10:00', paciente: 'Lucía Fernández', especialista: 'Dra. Ana Méndez', estado: 'AGENDADA' },
  ];

  readonly kpis: DashboardKpi[] = [
    {
      id: 'citas',
      label: 'Citas hoy',
      value: '0',
      sub: 'programadas',
      icon: 'calendar_month',
      variant: 'appointments',
      trend: '+0%',
      trendType: 'flat',
    },
    {
      id: 'examenes',
      label: 'Exámenes',
      value: '0',
      sub: 'solicitados',
      icon: 'science',
      variant: 'exams',
      trend: '+0%',
      trendType: 'flat',
    },
    {
      id: 'rx',
      label: 'Prescripciones',
      value: '0',
      sub: 'activas',
      icon: 'medication',
      variant: 'rx',
      trend: '+0%',
      trendType: 'flat',
    },
    {
      id: 'triaje',
      label: 'En triaje',
      value: '0',
      sub: 'en espera',
      icon: 'local_hospital',
      variant: 'triage',
      trend: '—',
      trendType: 'flat',
    },
    {
      id: 'stock',
      label: 'Alertas stock',
      value: '0',
      sub: 'medicamentos',
      icon: 'inventory_2',
      variant: 'stock',
      trend: '0%',
      trendType: 'flat',
    },
    {
      id: 'crit',
      label: 'Críticos',
      value: '0',
      sub: 'pacientes',
      icon: 'monitor_heart',
      variant: 'critical',
      trend: '—',
      trendType: 'flat',
    },
  ];

  /** Demostración visual de “Próximas citas”; vaciar al enlazar agenda real. */
  readonly upcomingDemo: {
    time: string;
    initials: string;
    name: string;
    sub: string;
    pill: string;
    pillClass: 'purple' | 'blue' | 'green';
  }[] = [
    {
      time: '09:30',
      initials: 'MR',
      name: 'María Rojas',
      sub: 'Medicina general',
      pill: 'Confirmada',
      pillClass: 'purple',
    },
    {
      time: '10:15',
      initials: 'CP',
      name: 'Carlos Pérez',
      sub: 'Cardiología',
      pill: 'En espera',
      pillClass: 'blue',
    },
    {
      time: '11:00',
      initials: 'LF',
      name: 'Lucía Fernández',
      sub: 'Pediatría',
      pill: 'Atendida',
      pillClass: 'green',
    },
  ];

  readonly alertsDemo = [
    { icon: 'warning_amber', text: 'Stock bajo: Amoxicilina 500 mg (Sede Central)' },
    { icon: 'favorite', text: 'Paciente en observación — revisar signos vitales' },
    { icon: 'assignment_late', text: '3 resultados de laboratorio pendientes de validar' },
  ];

  /** Serie de ejemplo para “Actividad del día” hasta conectar métricas reales. */
  readonly activityChart: any = {
    series: [
      {
        name: 'Actividad',
        data: [12, 18, 15, 22, 28, 24, 32, 30, 26, 34, 31, 38],
      },
    ],
    chart: {
      type: 'area',
      height: 268,
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#7c3aed'],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.42,
        opacityTo: 0.02,
        stops: [0, 92, 100],
      },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: '#fff',
      colors: ['#7c3aed'],
    },
    xaxis: {
      categories: ['7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
    },
    grid: {
      borderColor: '#eef2f7',
      strokeDashArray: 4,
      padding: { top: 8, right: 8, bottom: 0, left: 8 },
    },
    tooltip: { theme: 'light', x: { show: true } },
  };

  readonly donutChart: any = {
    series: [42, 28, 18, 12],
    chart: {
      type: 'donut',
      height: 280,
      fontFamily: 'inherit',
    },
    labels: ['Atendidas', 'En espera', 'En consulta', 'Canceladas'],
    colors: ['#10b981', '#3b82f6', '#7c3aed', '#cbd5e1'],
    legend: {
      position: 'right',
      fontSize: '12px',
      fontWeight: 600,
      markers: { size: 6 },
      labels: { colors: '#475569' },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: false },
            value: {
              fontSize: '22px',
              fontWeight: 700,
              color: '#1e1040',
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Citas',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              formatter: () => '100',
            },
          },
        },
      },
    },
  };
}

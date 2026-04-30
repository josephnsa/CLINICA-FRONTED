import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { DatePickerFieldComponent } from 'src/app/shared/datetime/date-picker-field.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { AgendaService } from 'src/app/core/services/agenda.service';
import {
  AppointmentResponse,
  DashboardRecentTransactionDto,
  DashboardRevenuePointDto,
  DashboardYearlyBreakupDto,
} from 'src/app/core/models';

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

interface DashboardUpcomingRow {
  time: string;
  initials: string;
  name: string;
  sub: string;
  pill: string;
  pillClass: 'purple' | 'blue' | 'green';
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
export class MaestroDashboardClinicoComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly agendaService = inject(AgendaService);

  readonly dashboardDate = new FormControl<Date | null>(new Date());
  readonly selectedSedeId = new FormControl<string>('');
  readonly sedes: { id: string; name: string }[] = [];

  readonly displayedColumns: (keyof DashboardCitaRow)[] = ['hora', 'paciente', 'especialista', 'estado'];
  recentCitas: DashboardCitaRow[] = [];
  loading = false;

  kpis: DashboardKpi[] = [
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

  upcomingDemo: DashboardUpcomingRow[] = [];
  alertsDemo: { icon: string; text: string }[] = [];

  /** Serie de ejemplo para “Actividad del día” hasta conectar métricas reales. */
  activityChart: any = {
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

  donutChart: any = {
    series: [0, 0, 0, 0],
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
              formatter: () => '0',
            },
          },
        },
      },
    },
  };

  ngOnInit(): void {
    this.dashboardDate.valueChanges.subscribe(() => this.loadDashboardData());
    this.selectedSedeId.valueChanges.subscribe(() => this.loadDashboardData());
    this.loadHeaderAndInitialData();
  }

  private loadHeaderAndInitialData(): void {
    this.dashboardService.getHeaderUser().subscribe({
      next: (res) => {
        const data = res.data;
        this.sedes.splice(0, this.sedes.length, ...(data.availableSedes ?? []));
        if (data.sedeId) {
          this.selectedSedeId.setValue(data.sedeId, { emitEvent: false });
        }
        this.loadDashboardData();
      },
      error: () => {
        this.loadDashboardData();
      },
    });
  }

  private loadDashboardData(): void {
    const sedeId = this.selectedSedeId.value;
    if (!sedeId) return;

    const date = this.dashboardDate.value ?? new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dayKey = date.toISOString().slice(0, 10);

    this.loading = true;

    this.dashboardService.getSummary(sedeId, year).subscribe({
      next: (res) => this.applySummary(res.data),
    });

    this.dashboardService.getNotifications(sedeId).subscribe({
      next: (res) => this.applyNotifications(res.data),
    });

    this.dashboardService.getRevenue(sedeId, year).subscribe({
      next: (res) => this.applyRevenueChart(res.data),
    });

    this.dashboardService.getYearlyBreakup(sedeId).subscribe({
      next: (res) => this.applyYearlyBreakup(res.data),
    });

    this.dashboardService.getRecentTransactions(sedeId, 4).subscribe({
      next: (res) => this.applyRecentTransactions(res.data),
    });

    this.dashboardService.getPerformance(sedeId, month, year).subscribe({
      next: (res) => {
        const total = res.data.reduce((acc, item) => acc + (item.appointmentCount ?? 0), 0);
        this.setKpiValue('rx', total);
      },
    });

    this.agendaService.getAllAppointments({ page: 0, size: 200 }).subscribe({
      next: (res) => {
        const appointments = (res.data ?? []).filter(
          (a) => a.sedeId === sedeId && (a.startTime ?? '').startsWith(dayKey)
        );
        this.applyAppointments(appointments);
        this.loading = false;
      },
      error: () => {
        this.recentCitas = [];
        this.upcomingDemo = [];
        this.loading = false;
      },
    });
  }

  private applySummary(summary: any): void {
    this.setKpiValue('citas', summary.currentMonthAppointments ?? 0);
    this.setKpiValue('crit', summary.newPatientsThisMonth ?? 0);
    this.setKpiTrend('citas', summary.monthOverMonthChange);
    this.setKpiTrend('examenes', summary.yearOverYearChange);
  }

  private applyNotifications(notif: any): void {
    this.setKpiValue('examenes', notif.pendingExamResults ?? 0);
    this.setKpiValue('stock', notif.lowStockItems ?? 0);
    this.alertsDemo = (notif.recent ?? []).slice(0, 4).map((n: any) => ({
      icon: this.iconBySeverity(n.severity),
      text: n.title ? `${n.title}: ${n.body}` : n.body,
    }));
  }

  private applyRevenueChart(points: DashboardRevenuePointDto[]): void {
    this.activityChart = {
      ...this.activityChart,
      series: [{ name: 'Ingresos', data: points.map((p) => p.totalInvoiced ?? 0) }],
      xaxis: {
        ...this.activityChart.xaxis,
        categories: points.map((p) => p.monthLabel || `M${p.month}`),
      },
    };
  }

  private applyYearlyBreakup(data: DashboardYearlyBreakupDto): void {
    const top = (data.years ?? [])[0];
    if (!top) return;
    this.setKpiTrend('rx', top.growthPercent ?? 0);
  }

  private applyRecentTransactions(items: DashboardRecentTransactionDto[]): void {
    if (!items?.length) return;
    const txAlerts = items.slice(0, 2).map((t) => ({
      icon: t.status === 'PAID' ? 'payments' : 'receipt_long',
      text: `${t.patientFullName}: ${t.description} (${t.amount.toFixed(2)})`,
    }));
    this.alertsDemo = [...txAlerts, ...this.alertsDemo].slice(0, 4);
  }

  private applyAppointments(appointments: AppointmentResponse[]): void {
    const sorted = [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
    this.recentCitas = sorted.slice(0, 8).map((a) => ({
      hora: this.toHour(a.startTime),
      paciente: a.patientName,
      especialista: a.doctorName,
      estado: this.statusLabel(a.status),
    }));

    this.upcomingDemo = sorted
      .filter((a) => ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status))
      .slice(0, 5)
      .map((a) => ({
        time: this.toHour(a.startTime),
        initials: this.initials(a.patientName),
        name: a.patientName,
        sub: a.serviceName,
        pill: this.statusLabel(a.status),
        pillClass: a.status === 'IN_PROGRESS' ? 'blue' : a.status === 'CHECKED_IN' ? 'green' : 'purple',
      }));

    const counts = {
      attended: sorted.filter((a) => a.status === 'ATTENDED').length,
      waiting: sorted.filter((a) => a.status === 'CHECKED_IN').length,
      inProgress: sorted.filter((a) => a.status === 'IN_PROGRESS').length,
      cancelled: sorted.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length,
    };
    const total = counts.attended + counts.waiting + counts.inProgress + counts.cancelled;
    this.donutChart = {
      ...this.donutChart,
      series: [counts.attended, counts.waiting, counts.inProgress, counts.cancelled],
      plotOptions: {
        ...this.donutChart.plotOptions,
        pie: {
          ...this.donutChart.plotOptions.pie,
          donut: {
            ...this.donutChart.plotOptions.pie.donut,
            labels: {
              ...this.donutChart.plotOptions.pie.donut.labels,
              total: {
                ...this.donutChart.plotOptions.pie.donut.labels.total,
                formatter: () => String(total),
              },
            },
          },
        },
      },
    };

    this.setKpiValue('triaje', counts.waiting);
  }

  private setKpiValue(id: string, value: number): void {
    this.kpis = this.kpis.map((k) => (k.id === id ? { ...k, value: String(value) } : k));
  }

  private setKpiTrend(id: string, raw?: number): void {
    const v = Number(raw ?? 0);
    const trendType: 'up' | 'down' | 'flat' = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
    const trend = v === 0 ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
    this.kpis = this.kpis.map((k) => (k.id === id ? { ...k, trendType, trend } : k));
  }

  private toHour(dt: string): string {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  private statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'AGENDADA',
      CONFIRMED: 'AGENDADA',
      CHECKED_IN: 'TRIAJE',
      IN_PROGRESS: 'EN_CONSULTA',
      ATTENDED: 'ATENDIDA',
      CANCELLED: 'CANCELADA',
      NO_SHOW: 'CANCELADA',
    };
    return map[status] ?? status;
  }

  private initials(name: string): string {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }

  private iconBySeverity(severity: string): string {
    const s = (severity || '').toUpperCase();
    if (s === 'CRITICAL' || s === 'HIGH') return 'warning_amber';
    if (s === 'MEDIUM') return 'report_problem';
    return 'notifications';
  }
}

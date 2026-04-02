import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { HrmService } from '../../../core/services/hrm.service';
import { Employee, EmployeeRole, EMPLOYEE_ROLES } from '../../../core/models/hrm.model';
import { formatDateToYmd } from 'src/app/shared/datetime/datetime.utils';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  templateUrl: './empleados.component.html',
})
export class EmpleadosComponent implements OnInit {
  private hrmService = inject(HrmService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  employees = signal<Employee[]>([]);
  loading = signal(false);
  searchText = signal('');
  showForm = signal(false);
  saving = signal(false);

  roles = EMPLOYEE_ROLES;
  displayedColumns = ['nombre', 'rol', 'colegiatura', 'contratacion', 'estado', 'acciones'];

  form = this.fb.group({
    firstName:     ['', Validators.required],
    lastName:      ['', Validators.required],
    userId:        ['', Validators.required],
    sedeId:        ['', Validators.required],
    role:          ['', Validators.required],
    licenseNumber: [''],
    hireDate: [null as Date | null, Validators.required],
  });

  ngOnInit() {
  const token = localStorage.getItem('auth_token');
  const payload = JSON.parse(atob(token!.split('.')[1]));
  console.log('payload:', JSON.stringify(payload));
  this.loadEmployees();
}

  loadEmployees() {
    this.loading.set(true);
    this.hrmService.getEmployees().subscribe({
      next: (data) => { this.employees.set(data); this.loading.set(false); },
      error: () => { this.snack.open('Error al cargar empleados', 'Cerrar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  get filteredEmployees(): Employee[] {
    const txt = this.searchText().toLowerCase();
    if (!txt) return this.employees();
    return this.employees().filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(txt) ||
      e.role.toLowerCase().includes(txt)
    );
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const hireDate =
      v.hireDate instanceof Date ? formatDateToYmd(v.hireDate) : '';

    this.hrmService.createEmployee({
      firstName:     v.firstName!,
      lastName:      v.lastName!,
      userId:        v.userId!,
      sedeId:        v.sedeId!,
      role:          v.role as EmployeeRole,
      licenseNumber: v.licenseNumber || undefined,
      hireDate,
    }).subscribe({
      next: () => {
        this.snack.open('Empleado registrado', 'Cerrar', { duration: 3000 });
        this.form.reset();
        this.showForm.set(false);
        this.saving.set(false);
        this.loadEmployees();
      },
      error: () => { this.saving.set(false); },
    });
  }

  verHorarios(employee: Employee) {
    this.router.navigate(['/hrm/horarios', employee.id]);
  }

  deactivate(employee: Employee) {
    if (!confirm(`¿Desactivar a ${employee.firstName} ${employee.lastName}?`)) return;
    this.hrmService.deactivateEmployee(employee.id).subscribe({
      next: () => { this.snack.open('Empleado desactivado', 'Cerrar', { duration: 3000 }); this.loadEmployees(); },
      error: () => this.snack.open('Error al desactivar', 'Cerrar', { duration: 3000 }),
    });
  }

  getRolColor(role: EmployeeRole): string {
    const map: Record<string, string> = {
      'MÉDICO':        'bg-blue-100 text-blue-800',
      'ENFERMERO':     'bg-green-100 text-green-800',
      'TÉCNICO':       'bg-yellow-100 text-yellow-800',
      'FARMACÉUTICO':  'bg-purple-100 text-purple-800',
      'CAJERO':        'bg-orange-100 text-orange-800',
      'RECEPCIONISTA': 'bg-pink-100 text-pink-800',
      'ADMINISTRATIVO':'bg-gray-100 text-gray-800',
    };
    return map[role] ?? 'bg-gray-100 text-gray-700';
  }
}
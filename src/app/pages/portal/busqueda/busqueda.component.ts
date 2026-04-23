import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PortalService } from 'src/app/core/services/portal.service';
import { PortalDoctor } from 'src/app/core/models/portal.model';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCardModule, MatChipsModule,
  ],
  templateUrl: './busqueda.component.html',
})
export class BusquedaComponent implements OnInit {
  private svc    = inject(PortalService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  doctors  = signal<PortalDoctor[]>([]);
  filtered = signal<PortalDoctor[]>([]);
  loading  = signal(false);

  patient = this.svc.getPatient();

  filterForm = this.fb.group({
    query:     [''],
    specialty: [''],
  });

  specialties = signal<string[]>([]);

  ngOnInit() {
    this.loading.set(true);
    this.svc.getDoctors().subscribe({
      next: (list) => {
        this.doctors.set(list);
        this.filtered.set(list);
        const unique = [...new Set(list.map(d => d.specialty))];
        this.specialties.set(unique);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const { query, specialty } = this.filterForm.value;
    let result = this.doctors();
    if (specialty) result = result.filter(d => d.specialty === specialty);
    if (query)     result = result.filter(d =>
      d.doctorName.toLowerCase().includes(query!.toLowerCase()) ||
      d.specialty.toLowerCase().includes(query!.toLowerCase())
    );
    this.filtered.set(result);
  }

  reservar(doctor: PortalDoctor) {
    this.router.navigate(['/portal/reserva'], {
      queryParams: { doctorId: doctor.id, specialty: doctor.specialty }
    });
  }

  logout() {
    this.svc.logout();
    this.router.navigate(['/portal/registro']);
  }
}
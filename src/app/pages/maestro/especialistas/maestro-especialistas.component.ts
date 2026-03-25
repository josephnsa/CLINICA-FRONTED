import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { ApiResponse, Doctor, Specialty } from 'src/app/core/models';

@Component({
  selector: 'app-maestro-especialistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './maestro-especialistas.component.html',
})
export class MaestroEspecialistasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);

  specialties: Specialty[] = [];
  filteredSpecialties: Specialty[] = [];
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];

  specialtiesDisplayedColumns = ['code', 'name', 'active'];
  doctorsDisplayedColumns = ['fullName', 'licenseNumber', 'specialtyName', 'active'];

  specialtiesFiltersForm = this.fb.group({
    search: [''],
  });

  doctorsFiltersForm = this.fb.group({
    search: [''],
    specialtyId: [''],
  });

  ngOnInit(): void {
    this.loadSpecialties();
    this.loadDoctors();
  }

  loadSpecialties(): void {
    this.catalogService.getSpecialties().subscribe({
      next: (resp: ApiResponse<Specialty[]>) => {
        this.specialties = resp.data;
        this.applySpecialtiesFilter();
      },
      error: () => {},
    });
  }

  applySpecialtiesFilter(): void {
    const term = (this.specialtiesFiltersForm.value.search ?? '').toLowerCase();
    if (!term) {
      this.filteredSpecialties = this.specialties;
      return;
    }
    this.filteredSpecialties = this.specialties.filter(
      (s) =>
        s.code.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term)
    );
  }

  loadDoctors(): void {
    const { search, specialtyId } = this.doctorsFiltersForm.value;
    this.catalogService
      .getDoctors({
        q: search ?? '',
        specialtyId: specialtyId ?? '',
      })
      .subscribe({
        next: (resp: ApiResponse<Doctor[]>) => {
          this.doctors = resp.data;
          this.filteredDoctors = this.doctors;
        },
        error: () => {},
      });
  }

  applyDoctorsFilter(): void {
    const term = (this.doctorsFiltersForm.value.search ?? '').toLowerCase();
    if (!term) {
      this.filteredDoctors = this.doctors;
      return;
    }
    this.filteredDoctors = this.doctors.filter((d) =>
      `${d.fullName} ${d.licenseNumber}`.toLowerCase().includes(term)
    );
  }

  onSearchSpecialties(): void {
    this.applySpecialtiesFilter();
  }

  onSearchDoctors(): void {
    this.loadDoctors();
  }
}


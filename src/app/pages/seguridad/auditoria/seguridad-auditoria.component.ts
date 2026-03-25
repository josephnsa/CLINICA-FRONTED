import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SecurityService } from 'src/app/core/services/security.service';
import { ApiResponse, AuditLog, AuditLogListResponse } from 'src/app/core/models';

@Component({
  selector: 'app-seguridad-auditoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './seguridad-auditoria.component.html',
})
export class SeguridadAuditoriaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);

  filtersForm = this.fb.group({
    userId: [''],
    action: [''],
  });

  logs: AuditLog[] = [];
  isLoading = false;
  displayedColumns = ['createdAt', 'module', 'action', 'entityId', 'details', 'ipAddress'];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page = 0): void {
    const { userId, action } = this.filtersForm.value;
    this.isLoading = true;
    this.securityService
      .getAuditLogs({
        action: action ?? '',
        userId: userId ?? '',
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<AuditLogListResponse>) => {
          this.logs = resp.data.items;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    this.loadLogs(0);
  }
}


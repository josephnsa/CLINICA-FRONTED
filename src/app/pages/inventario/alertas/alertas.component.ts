import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { LowStockAlert, ApiResponse } from 'src/app/core/models';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './alertas.component.html',
})
export class AlertasComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);

  alerts: LowStockAlert[] = [];
  displayedColumns = ['medicationName', 'currentStock', 'minStock'];

  ngOnInit(): void {
    this.loadAlerts();
  }

  getSedeId(): string {
    try {
      const token = localStorage.getItem('auth_token') ?? '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sedeId ?? '';
    } catch {
      return '';
    }
  }

  loadAlerts(): void {
    const sedeId = this.getSedeId();
    if (!sedeId) {
      console.warn('No sedeId en el token');
      return;
    }
    this.inventoryService.getLowStockAlerts(sedeId).subscribe({
      next: (resp: ApiResponse<LowStockAlert[]>) => { this.alerts = resp.data; },
      error: () => {},
    });
  }
}
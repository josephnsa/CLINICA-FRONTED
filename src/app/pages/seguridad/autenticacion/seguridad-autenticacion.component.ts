import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthMeData, JwtPayload, LoginData } from 'src/app/core/models';

@Component({
  selector: 'app-seguridad-autenticacion',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './seguridad-autenticacion.component.html',
})
export class SeguridadAutenticacionComponent implements OnInit {
  private readonly authService = inject(AuthService);

  currentUser: LoginData | null = null;
  meData: AuthMeData | null = null;
  tokenPayload: JwtPayload | null = null;
  isRefreshing = false;
  isLoadingMe = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.tokenPayload = this.authService.getTokenPayload();
    this.loadMe();
  }

  refreshToken(): void {
    this.isRefreshing = true;
    this.authService.refreshToken().subscribe({
      next: () => {
        this.currentUser = this.authService.getCurrentUser();
        this.tokenPayload = this.authService.getTokenPayload();
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
      },
    });
  }

  loadMe(): void {
    this.isLoadingMe = true;
    this.authService.getMe().subscribe({
      next: (resp) => {
        this.meData = resp.data;
        this.isLoadingMe = false;
      },
      error: () => {
        this.isLoadingMe = false;
      },
    });
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginData } from 'src/app/core/models';

@Component({
  selector: 'app-topstrip',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent implements OnInit {
  currentUser: LoginData | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}

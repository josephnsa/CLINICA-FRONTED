import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/config';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent {
  constructor(private readonly authService: AuthService) {}
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;


  @Output() optionsChange = new EventEmitter<AppSettings>();

  logout(): void {
    this.authService.logout();
  }
}
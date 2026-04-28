import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  inject,
  OnInit,
  computed,
  signal,
  HostListener,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { concatMap } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { AppSettings } from 'src/app/config';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { HeaderUserDto, NotificationSummaryDto } from 'src/app/core/models/dashboard.model';
import { GlobalSearchDialogComponent } from '../global-search-dialog/global-search-dialog.component';

@Component({
  selector: 'app-header',
  imports: [TablerIconsModule, MaterialModule],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(MatDialog);

  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() optionsChange = new EventEmitter<AppSettings>();

  readonly me = signal<HeaderUserDto | null>(null);
  readonly notifications = signal<NotificationSummaryDto | null>(null);

  readonly displayName = computed(() => {
    const m = this.me();
    if (m?.fullName) return m.fullName;
    return this.authService.getCurrentUser()?.fullName ?? 'Usuario';
  });

  readonly displayRole = computed(() => {
    const m = this.me();
    return m?.roleLabel || m?.role || this.authService.getRole() || '';
  });

  readonly initials = computed(() => {
    const m = this.me();
    if (m?.initials?.trim()) return m.initials.trim();
    return this.initialsFromName(this.displayName());
  });

  readonly sedeLabel = computed(() => this.me()?.sedeName?.trim() || '');

  readonly totalUnread = computed(() => this.notifications()?.totalUnread ?? 0);

  readonly recentNotifications = computed(
    () => this.notifications()?.recent ?? []
  );

  readonly logoSrc = 'assets/images/logos/logo_clinica_solo.png';

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) {
      return;
    }
    const el = ev.target as HTMLElement | null;
    if (!el) return;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) {
      return;
    }
    ev.preventDefault();
    this.openGlobalSearch();
  }

  openGlobalSearch(): void {
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    this.dialog.open(GlobalSearchDialogComponent, {
      width: 'min(640px, 96vw)',
      maxHeight: '90vh',
      panelClass: 'clinica-global-search-panel',
      backdropClass: 'clinica-global-search-backdrop',
      autoFocus: true,
      restoreFocus: true,
    });
  }

  ngOnInit(): void {
    this.applyFallbackUser();
    this.authService.syncSession().pipe(
      concatMap(() => this.dashboardService.getHeaderUser())
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.me.set(res.data);
          this.loadNotifications(res.data.sedeId);
        }
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private loadNotifications(sedeId: string): void {
    if (!sedeId) return;
    this.dashboardService.getNotifications(sedeId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications.set(res.data);
        }
      },
    });
  }

  private applyFallbackUser(): void {
    const sedeId = this.jwtSedeId() ?? '';
    const u = this.authService.getCurrentUser();
    const name = u?.fullName ?? 'Usuario';
    this.me.set({
      userId: '',
      fullName: name,
      initials: this.initialsFromName(name),
      role: u?.role ?? '',
      roleLabel: u?.role ?? '',
      sedeId,
      sedeName: '',
      availableSedes: [],
    });
    this.loadNotifications(sedeId);
  }

  private jwtSedeId(): string | null {
    const p = this.authService.getTokenPayload();
    const raw = p?.['sedeId'];
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  }

  private initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}

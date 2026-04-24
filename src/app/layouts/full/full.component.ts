import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { AppSettings } from 'src/app/config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppNavItemComponent } from './sidebar/nav-item/nav-item.component';
import { navItems as staticNavItems } from './sidebar/sidebar-data';
import { NavItem } from './sidebar/nav-item/nav-item';
import { MenuItemDto } from 'src/app/core/models';
import { AuthService } from 'src/app/core/auth/auth.service';
import { MENU_SECTION_LAYOUT } from './menu-sections.config';
import { normalizeMenuRoute } from 'src/app/core/utils/nav-route.util';

const MOBILE_VIEW   = 'screen and (max-width: 768px)';
const TABLET_VIEW   = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW  = 'screen and (min-width: 1024px)';
const BELOWMONITOR  = 'screen and (max-width: 1023px)';

// Iconos Iconify (tabler) para cada grupo de menú que devuelve el backend
const GROUP_ICONS: Record<string, string> = {
  'Seguridad y Accesos':               'tabler:shield-lock',
  'Maestro Clínico':                   'tabler:stethoscope',
  'Pacientes e Historia Clínica':      'tabler:users',
  'Agenda, Disponibilidad y Atención': 'tabler:calendar-event',
  'Portal del Paciente':               'tabler:user-circle',
  'Prescripción y Medicación':         'tabler:pill',
  'Exámenes y Resultados':             'tabler:microscope',
  'Facturación y Caja':                'tabler:receipt',
  'Inventario y Farmacia':             'tabler:box',
  'RR.HH. y Empleados':               'tabler:users-group',
  'Atención al Cliente':               'tabler:headset',
  'Reportes y Analítica':              'tabler:chart-bar',
  'Configuración e Integraciones':     'tabler:settings',
};

@Component({
  selector: 'app-full',
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
  ],
  templateUrl: './full.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnInit {
  navItems: NavItem[] = [];

  @ViewChild('leftsidenav') public sidenav: MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean   { return this.isMobileScreen; }
  get isTablet(): boolean { return this.resView; }

  isFilterNavOpen = false;

  constructor(
    private settings: CoreService,
    private mediaMatcher: MediaMatcher,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private navService: NavService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
      .subscribe((state) => {
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[BELOWMONITOR];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
        this.resView = state.breakpoints[BELOWMONITOR];
      });

    this.receiveOptions(this.options);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void {
    // Primero sincronizamos el rol desde el backend (detecta cambios de rol sin re-login),
    // luego recargamos el menú fresco según el rol actual en DB.
    // Esto corrige el bug donde el frontend muestra menú de ADMIN tras cambiar de rol.
    this.authService.syncSession().subscribe({
      complete: () => {
        this.authService.loadMenu().subscribe({
          next: () => this.buildNavItems(),
          error: () => this.buildNavItems(),
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleFilterNav(): void {
    this.isFilterNavOpen = !this.isFilterNavOpen;
    this.cdr.detectChanges();
  }

  toggleCollapsed(): void {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400): void {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart(): void { this.isContentWidthFixed = false; }

  onSidenavOpenedChange(isOpened: boolean): void {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }

  receiveOptions(options: AppSettings): void {
    this.toggleDarkTheme(options);
    this.toggleColorsTheme(options);
  }

  toggleDarkTheme(options: AppSettings): void {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }

  toggleColorsTheme(options: AppSettings): void {
    this.htmlElement.classList.forEach((className) => {
      if (className.endsWith('_theme')) {
        this.htmlElement.classList.remove(className);
      }
    });
    this.htmlElement.classList.add(options.activeTheme);
  }

  // ── Construcción del menú ─────────────────────────────────────────────────────

  private buildNavItems(): void {
    const menuRaw = localStorage.getItem('auth_menu');
    let dynamicItems: NavItem[] = [];

    if (menuRaw) {
      try {
        const menu: MenuItemDto[] = JSON.parse(menuRaw) as MenuItemDto[];
        dynamicItems = this.mapMenuToAccordion(menu);
      } catch {
        dynamicItems = [];
      }
    }

    this.navItems = [
      ...this.buildSectionedNav(dynamicItems),
      ...staticNavItems,
    ];
    this.cdr.detectChanges();
  }

  /**
   * Ordena los grupos del API en secciones (GENERAL, PACIENTES, …) y añade
   * enlaces extra (Dashboard). Los grupos no clasificados van bajo "OTROS".
   */
  private buildSectionedNav(accordionGroups: NavItem[]): NavItem[] {
    if (!accordionGroups.length) {
      return [];
    }

    const byLabel = new Map<string, NavItem>();
    for (const g of accordionGroups) {
      if (g.displayName) {
        byLabel.set(g.displayName, g);
      }
    }

    const used = new Set<string>();
    const result: NavItem[] = [];

    for (const section of MENU_SECTION_LAYOUT) {
      result.push({ navCap: section.title });

      for (const extra of section.extraItems ?? []) {
        result.push({ ...extra });
      }

      for (const label of section.groupLabels) {
        const node = byLabel.get(label);
        if (node) {
          result.push(node);
          used.add(label);
        }
      }
    }

    const leftovers = accordionGroups.filter(
      (g) => !!g.displayName && !used.has(g.displayName)
    );
    if (leftovers.length) {
      result.push({ navCap: 'OTROS' });
      result.push(...leftovers);
    }

    return result;
  }

  /**
   * Convierte los grupos del menú a ítems colapsables (accordion).
   * Cada grupo se muestra como un ítem padre con flecha y sus hijos anidados.
   * ANTES era navCap (encabezado plano). AHORA es ítem expandible con animación.
   */
  private mapMenuToAccordion(menu: MenuItemDto[]): NavItem[] {
    return menu.map((group: MenuItemDto): NavItem => ({
      displayName: group.label,
      iconName: GROUP_ICONS[group.label] ?? 'tabler:folder',
      children: this.mapChildren(group.children ?? []),
    }));
  }

  private mapChildren(children: MenuItemDto[]): NavItem[] {
    return children.map((item: MenuItemDto): NavItem => {
      const navItem: NavItem = {
        displayName: item.label,
        iconName: 'tabler:point',
        route: normalizeMenuRoute(item.route) ?? undefined,
      };
      if (item.children && item.children.length > 0) {
        navItem.children = this.mapChildren(item.children);
        navItem.iconName = 'tabler:folder';
      }
      return navItem;
    });
  }
}

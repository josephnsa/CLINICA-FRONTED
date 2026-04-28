import { Injectable } from '@angular/core';
import { MenuItemDto } from 'src/app/core/models';
import { normalizeMenuRoute } from 'src/app/core/utils/nav-route.util';
import { MENU_SECTION_LAYOUT } from './menu-sections.config';

export interface GlobalSearchEntry {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  iconTabler: string;
}

/** Convierte iconos del menú API (PrimeIcons) a prefijo Iconify Tabler. */
function menuIconToTabler(icon?: string | null): string {
  if (!icon?.trim()) {
    return 'tabler:layout-grid';
  }
  const i = icon.trim();
  if (i.startsWith('tabler:')) {
    return i;
  }
  const map: Record<string, string> = {
    'pi pi-shield': 'tabler:shield-lock',
    'pi pi-users': 'tabler:users',
    'pi pi-lock': 'tabler:lock',
    'pi pi-history': 'tabler:history',
    'pi pi-building': 'tabler:building',
    'pi pi-book': 'tabler:book',
    'pi pi-list': 'tabler:list',
    'pi pi-id-card': 'tabler:id-badge',
    'pi pi-heart': 'tabler:heart',
    'pi pi-briefcase': 'tabler:briefcase',
    'pi pi-credit-card': 'tabler:credit-card',
    'pi pi-user': 'tabler:user',
    'pi pi-user-plus': 'tabler:user-plus',
    'pi pi-file-edit': 'tabler:file-pencil',
    'pi pi-notebook': 'tabler:notebook',
    'pi pi-file': 'tabler:file-text',
    'pi pi-calendar': 'tabler:calendar',
    'pi pi-calendar-plus': 'tabler:calendar-plus',
    'pi pi-sliders-h': 'tabler:adjustments-horizontal',
    'pi pi-calendar-times': 'tabler:calendar-x',
    'pi pi-sign-in': 'tabler:login',
    'pi pi-heartbeat': 'tabler:heartbeat',
    'pi pi-user-md': 'tabler:stethoscope',
    'pi pi-globe': 'tabler:world',
    'pi pi-search': 'tabler:search',
    'pi pi-bell': 'tabler:bell',
    'pi pi-clipboard': 'tabler:clipboard-list',
    'pi pi-check-square': 'tabler:square-check',
    'pi pi-chart-line': 'tabler:chart-line',
    'pi pi-file-import': 'tabler:file-import',
    'pi pi-clock': 'tabler:clock',
    'pi pi-check': 'tabler:circle-check',
    'pi pi-wallet': 'tabler:wallet',
    'pi pi-file-export': 'tabler:file-export',
    'pi pi-dollar': 'tabler:currency-dollar',
    'pi pi-refresh': 'tabler:refresh',
    'pi pi-box': 'tabler:package',
    'pi pi-truck': 'tabler:truck',
    'pi pi-exclamation-triangle': 'tabler:alert-triangle',
    'pi pi-chart-bar': 'tabler:chart-bar',
    'pi pi-comments': 'tabler:messages',
    'pi pi-phone': 'tabler:phone',
    'pi pi-calendar-minus': 'tabler:calendar-minus',
    'pi pi-flag': 'tabler:flag',
    'pi pi-star': 'tabler:star',
    'pi pi-cog': 'tabler:settings',
    'pi pi-file-excel': 'tabler:file-spreadsheet',
    'pi pi-code': 'tabler:code',
  };
  return map[i] ?? 'tabler:layout-grid';
}

@Injectable({ providedIn: 'root' })
export class MenuIndexService {
  private readonly authMenuKey = 'auth_menu';

  /** Solo Dashboard (extra) + submódulos con ruta; sin filas de módulo padre. */
  buildSearchIndex(): GlobalSearchEntry[] {
    const raw = localStorage.getItem(this.authMenuKey);
    if (!raw) {
      return this.extraEntriesOnly();
    }
    try {
      const menu = JSON.parse(raw) as MenuItemDto[];
      if (!Array.isArray(menu) || menu.length === 0) {
        return this.extraEntriesOnly();
      }
      return this.flattenMenu(menu);
    } catch {
      return this.extraEntriesOnly();
    }
  }

  private extraEntriesOnly(): GlobalSearchEntry[] {
    const out: GlobalSearchEntry[] = [];
    for (const section of MENU_SECTION_LAYOUT) {
      for (const ex of section.extraItems ?? []) {
        if (ex.displayName && ex.route) {
          out.push({
            id: `extra:${ex.route}`,
            title: ex.displayName,
            subtitle: `${section.title} · Acceso rápido`,
            route: ex.route,
            iconTabler: ex.iconName ?? 'tabler:layout-dashboard',
          });
        }
      }
    }
    return out;
  }

  private sectionForGroupLabel(label: string): string {
    for (const sec of MENU_SECTION_LAYOUT) {
      if (sec.groupLabels.includes(label)) {
        return sec.title;
      }
    }
    return 'OTROS';
  }

  private flattenMenu(menu: MenuItemDto[]): GlobalSearchEntry[] {
    const out: GlobalSearchEntry[] = [];

    for (const section of MENU_SECTION_LAYOUT) {
      for (const ex of section.extraItems ?? []) {
        if (ex.displayName && ex.route) {
          out.push({
            id: `extra:${ex.route}`,
            title: ex.displayName,
            subtitle: `${section.title} · Acceso rápido`,
            route: ex.route,
            iconTabler: ex.iconName ?? 'tabler:layout-dashboard',
          });
        }
      }
    }

    for (const group of menu) {
      const section = this.sectionForGroupLabel(group.label);
      this.walkChildren(group.children ?? [], {
        section,
        moduleLabel: group.label,
        out,
      });
    }

    return out;
  }

  private walkChildren(
    items: MenuItemDto[],
    ctx: { section: string; moduleLabel: string; out: GlobalSearchEntry[] }
  ): void {
    for (const it of items) {
      const route = normalizeMenuRoute(it.route);
      if (route) {
        ctx.out.push({
          id: `leaf:${route}`,
          title: it.label,
          subtitle: `${ctx.section} · ${ctx.moduleLabel}`,
          route,
          iconTabler: menuIconToTabler(it.icon),
        });
      }
      if (it.children?.length) {
        this.walkChildren(it.children, ctx);
      }
    }
  }
}

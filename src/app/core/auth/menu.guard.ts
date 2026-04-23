import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MenuItemDto } from '../models';

const ALWAYS_ALLOWED = ['dashboard', 'extra', 'ui-components'];

@Injectable({ providedIn: 'root' })
export class MenuGuard implements CanActivateChild {
  constructor(private readonly router: Router) {}

  canActivateChild(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const firstSegment = state.url.split('?')[0].replace(/^\//, '').split('/')[0];

    if (ALWAYS_ALLOWED.includes(firstSegment)) {
      return true;
    }

    const menuRaw = localStorage.getItem('auth_menu');
    if (!menuRaw) {
      return this.router.createUrlTree(['/dashboard']);
    }

    try {
      const menu: MenuItemDto[] = JSON.parse(menuRaw);
      const permittedSegments = this.extractFirstSegments(menu);

      if (permittedSegments.has(firstSegment)) {
        return true;
      }

      return this.router.createUrlTree(['/dashboard']);
    } catch {
      return this.router.createUrlTree(['/dashboard']);
    }
  }

  private extractFirstSegments(menu: MenuItemDto[]): Set<string> {
    const segments = new Set<string>();
    const collect = (items: MenuItemDto[]) => {
      for (const item of items) {
        if (item.route) {
          const seg = item.route.replace(/^\/+/, '').split('/')[0];
          if (seg) segments.add(seg);
        }
        if (item.children?.length) collect(item.children);
      }
    };
    collect(menu);
    return segments;
  }
}

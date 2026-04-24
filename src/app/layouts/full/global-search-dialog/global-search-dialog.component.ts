import {
  Component,
  ViewEncapsulation,
  inject,
  signal,
  computed,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MenuIndexService, GlobalSearchEntry } from '../menu-index.service';

@Component({
  selector: 'app-global-search-dialog',
  standalone: true,
  imports: [MatDialogModule, MatDividerModule, FormsModule, TablerIconsModule],
  templateUrl: './global-search-dialog.component.html',
  styleUrl: './global-search-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GlobalSearchDialogComponent implements AfterViewInit {
  private readonly dialogRef = inject(MatDialogRef<GlobalSearchDialogComponent>);
  private readonly router = inject(Router);
  private readonly menuIndex = inject(MenuIndexService);

  @ViewChild('queryInput') queryInput?: ElementRef<HTMLInputElement>;

  readonly query = signal('');
  readonly allEntries = signal<GlobalSearchEntry[]>([]);
  readonly selectedIndex = signal(0);

  readonly filtered = computed(() => {
    const q = fold(this.query());
    const list = this.allEntries();
    if (!q.trim()) {
      return list;
    }
    const parts = q.split(/\s+/).filter(Boolean);
    return list.filter((e) => {
      const hay = fold(`${e.title} ${e.subtitle}`);
      return parts.every((p) => hay.includes(p));
    });
  });

  constructor() {
    this.allEntries.set(this.menuIndex.buildSearchIndex());
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.queryInput?.nativeElement?.focus());
  }

  @HostListener('keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    const list = this.filtered();
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = Math.min(this.selectedIndex() + 1, Math.max(0, list.length - 1));
      this.selectedIndex.set(next);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      const next = Math.max(this.selectedIndex() - 1, 0);
      this.selectedIndex.set(next);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const item = list[this.selectedIndex()];
      if (item) {
        this.pick(item);
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      this.dialogRef.close();
    }
  }

  onQueryInput(value: string): void {
    this.query.set(value);
    this.selectedIndex.set(0);
  }

  pick(entry: GlobalSearchEntry): void {
    const url = '/' + entry.route.replace(/^\/+/, '');
    this.dialogRef.close();
    void this.router.navigateByUrl(url);
  }
}

function fold(s: string): string {
  try {
    return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

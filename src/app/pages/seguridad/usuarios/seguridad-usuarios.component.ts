import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpErrorResponse } from '@angular/common/http';
import { SecurityService } from 'src/app/core/services/security.service';
import { ApiResponse, UserListResponse, UserSummary, Role } from 'src/app/core/models';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seguridad-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './seguridad-usuarios.component.html',
})
export class SeguridadUsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly securityService = inject(SecurityService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  filtersForm = this.fb.group({
    search: [''],
    role: [''],
    active: [''],
  });

  users: UserSummary[] = [];
  roles: Role[] = [];
  isLoading = false;

  displayedColumns = ['email', 'fullName', 'roleName', 'sedes', 'active', 'actions'];

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  get hasUsers(): boolean {
    return this.users && this.users.length > 0;
  }

  loadUsers(page = 0): void {
    const { search, role, active } = this.filtersForm.value;
    this.isLoading = true;
    this.securityService
      .getUsers({
        search: search ?? '',
        role: role ?? '',
        active: active === '' ? undefined : active === 'true',
        page,
        size: 20,
      })
      .subscribe({
        next: (resp: ApiResponse<UserListResponse>) => {
          this.users = resp.data.items;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  loadRoles(): void {
    this.securityService.getRoles().subscribe({
      next: (resp: ApiResponse<Role[]>) => {
        this.roles = resp.data;
      },
      error: () => {},
    });
  }

  onSearch(): void {
    this.loadUsers(0);
  }

  newUser(): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        isNew: true,
        user: {
          id: '',
          email: '',
          fullName: '',
          roleCode: '',
          roleName: '',
          active: true,
        } as UserSummary,
        roles: this.roles,
      },
    });

    dialogRef.afterClosed().subscribe((result?: UserEditResult) => {
      if (!result || !result.email?.trim() || !result.password?.length) {
        return;
      }
      const role = this.roles.find((r) => r.code === result.roleCode);
      if (!role) {
        this.snackBar.open('Rol no válido', 'Cerrar', { duration: 4000 });
        return;
      }
      this.securityService
        .createUser({
          email: result.email.trim(),
          password: result.password,
          fullName: result.fullName.trim(),
          roleId: role.id,
          active: result.active,
        })
        .subscribe({
          next: (resp: ApiResponse<UserSummary>) => {
            if (!resp.success || !resp.data) {
              this.snackBar.open(resp.message ?? 'No se pudo crear el usuario', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
            this.loadUsers(0);
          },
          error: (err: HttpErrorResponse) => {
            const msg =
              (err.error && typeof err.error === 'object' && err.error.message) ||
              'Error al crear el usuario';
            this.snackBar.open(String(msg), 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  editUser(user: UserSummary): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data: {
        isNew: false,
        user,
        roles: this.roles,
      },
    });

    dialogRef.afterClosed().subscribe((result?: UserEditResult) => {
      if (!result) {
        return;
      }
      const role = this.roles.find((r) => r.code === result.roleCode);
      if (!role) {
        this.snackBar.open('Rol no válido', 'Cerrar', { duration: 4000 });
        return;
      }
      this.securityService
        .updateUser(user.id, {
          fullName: result.fullName.trim(),
          roleId: role.id,
          active: result.active,
        })
        .subscribe({
          next: (resp: ApiResponse<UserSummary>) => {
            if (!resp.success || !resp.data) {
              this.snackBar.open(resp.message ?? 'No se pudo guardar', 'Cerrar', {
                duration: 5000,
              });
              return;
            }
            const row = resp.data;
            this.users = this.users.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    fullName: row.fullName,
                    roleCode: row.roleCode,
                    roleName: row.roleName,
                    active: row.active,
                  }
                : u
            );
            this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Error al guardar los cambios', 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  manageRoles(user: UserSummary): void {
    this.dialog.open(UserRolesDialogComponent, {
      width: '520px',
      data: {
        user,
      },
    });
  }
}

interface UserEditDialogData {
  isNew: boolean;
  user: UserSummary;
  roles: Role[];
}

interface UserEditResult {
  email?: string;
  password?: string;
  fullName: string;
  roleCode: string;
  active: boolean;
}

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  styles: [
    `
      h2[mat-dialog-title] {
        margin: 0;
        padding-bottom: 0;
      }
      mat-dialog-content {
        padding-top: 1rem !important;
      }
    `,
  ],
  template: `
    <h2 mat-dialog-title class="border-b border-slate-200/90 pb-4">
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
        >
          <mat-icon class="!h-6 !w-6 !text-[24px]">{{ data.isNew ? 'person_add' : 'manage_accounts' }}</mat-icon>
        </div>
        <div class="min-w-0 pt-0.5">
          <span class="block text-lg font-semibold tracking-tight text-slate-800">
            {{ data.isNew ? 'Nuevo usuario' : 'Editar usuario' }}
          </span>
          <p *ngIf="data.isNew" class="mt-1 text-sm leading-snug text-slate-500">
            Registra el acceso y el rol. El usuario podrá iniciar sesión con el correo y la contraseña.
          </p>
          <p *ngIf="!data.isNew" class="mt-1 text-sm leading-snug text-slate-500">
            Actualiza nombre, rol o estado. El correo no se puede modificar.
          </p>
        </div>
      </div>
    </h2>

    <mat-dialog-content [formGroup]="form" class="flex flex-col gap-5">
      <div
        *ngIf="!data.isNew"
        class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5"
      >
        <mat-icon class="mt-0.5 shrink-0 text-slate-400 !h-5 !w-5 !text-[20px]">alternate_email</mat-icon>
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Correo electrónico</p>
          <p class="truncate text-sm font-semibold text-slate-800">{{ data.user.email }}</p>
          <p class="mt-0.5 text-xs text-slate-500">No editable por seguridad</p>
        </div>
      </div>

      <div
        *ngIf="data.isNew"
        class="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white px-4 py-4 shadow-sm"
      >
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-indigo-600 !h-[18px] !w-[18px] !text-[18px]">vpn_key</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Credenciales de acceso
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Correo electrónico</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">mail</mat-icon>
            <input matInput type="email" formControlName="email" autocomplete="username" />
            <mat-error *ngIf="form.get('email')?.hasError('required')">Campo obligatorio</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Introduce un correo válido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contraseña</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">lock_outline</mat-icon>
            <input
              matInput
              type="password"
              formControlName="password"
              autocomplete="new-password"
            />
            <mat-hint align="start">Mínimo 8 caracteres</mat-hint>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Campo obligatorio</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Al menos 8 caracteres</mat-error>
          </mat-form-field>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center gap-2">
          <mat-icon class="text-slate-600 !h-[18px] !w-[18px] !text-[18px]">badge</mat-icon>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Datos del perfil
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre completo</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">person_outline</mat-icon>
            <input matInput formControlName="fullName" />
            <mat-error *ngIf="form.get('fullName')?.hasError('required')">Campo obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Rol en el sistema</mat-label>
            <mat-icon matPrefix class="mr-2 text-slate-400 !h-5 !w-5">admin_panel_settings</mat-icon>
            <mat-select formControlName="roleCode">
              <mat-option *ngFor="let r of data.roles" [value]="r.code">
                {{ r.name }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('roleCode')?.hasError('required')">Selecciona un rol</mat-error>
          </mat-form-field>
        </div>
      </div>

      <div
        class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
      >
        <mat-checkbox formControlName="active" color="primary" class="!mr-0">
          Cuenta activa
        </mat-checkbox>
        <span class="text-xs leading-relaxed text-slate-500">
          Si está desactivada, no podrá iniciar sesión.
        </span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions
      align="end"
      class="mt-0 border-t border-slate-100 bg-slate-50/40 px-6 py-3 !justify-end gap-2"
    >
      <button type="button" mat-stroked-button mat-dialog-close class="!min-w-[100px]">Cancelar</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        class="!min-w-[120px]"
        [disabled]="form.invalid"
        (click)="onSave()"
      >
        <span class="inline-flex items-center justify-center gap-1.5">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">check</mat-icon>
          Guardar
        </span>
      </button>
    </mat-dialog-actions>
  `,
})
export class UserEditDialogComponent {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditDialogData
  ) {
    if (this.data.isNew) {
      this.form = this.fb.group({
        email: [this.data.user.email, [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        fullName: [this.data.user.fullName, Validators.required],
        roleCode: [this.data.user.roleCode, Validators.required],
        active: [this.data.user.active],
      });
    } else {
      this.form = this.fb.group({
        fullName: [this.data.user.fullName, Validators.required],
        roleCode: [this.data.user.roleCode, Validators.required],
        active: [this.data.user.active],
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.value;
    if (this.data.isNew) {
      this.dialogRef.close({
        email: v.email,
        password: v.password,
        fullName: v.fullName,
        roleCode: v.roleCode,
        active: v.active,
      });
    } else {
      this.dialogRef.close({
        fullName: v.fullName,
        roleCode: v.roleCode,
        active: v.active,
      });
    }
  }
}

@Component({
  selector: 'app-user-roles-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>Roles y permisos</h2>
    <mat-dialog-content class="mt-2 space-y-2">
      <p>
        Usuario:
        <strong>{{ data.user.fullName }}</strong>
        ({{ data.user.email }})
      </p>
      <p>Rol actual: <strong>{{ data.user.roleName }}</strong></p>
      <p class="text-sm text-slate-500">
        Esta es una vista previa estática de roles / permisos. La integración real con
        el backend se conectará más adelante.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="mt-4">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class UserRolesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserSummary }
  ) {}
}


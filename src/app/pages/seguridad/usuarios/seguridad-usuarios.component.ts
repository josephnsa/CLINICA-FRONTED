import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SecurityService } from 'src/app/core/services/security.service';
import { ApiResponse, UserListResponse, UserSummary, Role } from 'src/app/core/models';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Inject } from '@angular/core';

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
      width: '520px',
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
      if (!result) {
        return;
      }
      const role = this.roles.find((r) => r.code === result.roleCode) || null;
      const newUser: UserSummary = {
        id: `tmp-${Date.now()}`,
        email: result.email,
        fullName: result.fullName,
        roleCode: result.roleCode,
        roleName: role ? role.name : result.roleCode,
        active: result.active,
        sedes: [],
      };
      this.users = [newUser, ...this.users];
    });
  }

  editUser(user: UserSummary): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '520px',
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
      const role = this.roles.find((r) => r.code === result.roleCode) || null;
      this.users = this.users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              email: result.email,
              fullName: result.fullName,
              roleCode: result.roleCode,
              roleName: role ? role.name : result.roleCode,
              active: result.active,
            }
          : u
      );
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
  email: string;
  fullName: string;
  roleCode: string;
  active: boolean;
}

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>{{ data.isNew ? 'Nuevo usuario' : 'Editar usuario' }}</h2>
    <mat-dialog-content [formGroup]="form" class="flex flex-col gap-4 mt-2">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Nombre completo</mat-label>
        <input matInput formControlName="fullName" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Rol</mat-label>
        <mat-select formControlName="roleCode">
          <mat-option *ngFor="let r of data.roles" [value]="r.code">
            {{ r.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-checkbox formControlName="active">Activo</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="mt-4">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
})
export class UserEditDialogComponent {
  form = this.fb.group({
    email: [this.data.user.email],
    fullName: [this.data.user.fullName],
    roleCode: [this.data.user.roleCode],
    active: [this.data.user.active],
  });

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditDialogData
  ) {}

  onSave(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.form.value as UserEditResult);
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


export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  roleCode: string;
  roleName: string;
  active: boolean;
  sedes?: string[];
}

export interface UserListResponse {
  total: number;
  items: UserSummary[];
}

export interface Role {
  id: string;
  code: string;
  name: string;
}

export interface Permission {
  id: string;
  code: string;
  description: string;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  module: string;
  action: string;
  entityId?: string | null;
  details?: string | null;
  userId: string;
  ipAddress?: string | null;
}

export interface AuditLogListResponse {
  total: number;
  items: AuditLog[];
}

export interface Sede {
  id: string;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  users: {
    roleCode: string;
    roleName: string;
    fullName: string;
    id: string;
    email: string;
  }[];
}


/**
 * `app/models/user.ts`
 *
 * Sprint 7 cleanup: Prisma kaldırıldı (Laravel API kullanılıyor).
 *
 * Bu dosya eski `import { User, UserStatus, UserRole, ... } from
 * '@/app/models/user'` çağrılarının TypeScript derlemesini geçirmesi
 * için minimal tip tanımları sağlar. UI bileşenleri Sprint 8'de
 * Laravel API'sine taşınırken bu tipler de silinecek.
 *
 * NOT: Prisma `$Enums.UserStatus` referansı kaldırıldı; status alanı
 * artık string union olarak modellenir.
 */

// Status — eskiden Prisma `$Enums.UserStatus`; artık basit string.
export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'SUSPENDED'
  | 'BLOCKED';

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
} as const;

// Modeller — sadece UI prop tipleri için iskelet
export interface User {
  id: string;
  email: string;
  password?: string | null;
  country?: string | null;
  timezone?: string | null;
  name?: string | null;
  roleId: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date | null;
  emailVerifiedAt?: Date | null;
  isTrashed: boolean;
  avatar?: string | null;
  invitedByUserId?: string | null;
  isProtected: boolean;
  role: UserRole;
  sessions?: Session[];
  accounts?: Account[];
}

export interface UserRole {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isTrashed: boolean;
  createdByUserId?: string | null;
  createdAt: Date;
  isProtected: boolean;
  isDefault: boolean;
  createdByUser?: User | null;
  users?: User[];
  permissions?: UserRolePermission[];
}

export interface UserPermission {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  createdByUserId?: string | null;
  createdAt: Date;
  createdByUser?: User | null;
  roles?: UserRolePermission[];
}

export interface UserRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  assignedAt: Date;
  role?: UserRole;
  permission?: UserPermission;
}

export interface UserAddress {
  id: string;
  userId: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  user?: User;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user?: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user?: User;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// SystemSetting — getSettings() için kullanılıyordu; lib/db.ts shim'inde
// referansı kalmasın diye burada yeniden export ediyoruz.
import type { SystemSetting } from './system';
export type { SystemSetting };
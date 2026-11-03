// src/lib/adminRbac.ts
// Centralized RBAC permission matrix for the admin system.
// Keep this as pure constants — no DB calls — so it is instant and cacheable.

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST', 'VIEWER'] as const;
export type AdminRole = typeof ADMIN_ROLES[number];

export const PERMISSIONS = [
  // Users
  'users.view', 'users.edit', 'users.delete', 'users.impersonate',
  // Reports
  'reports.view', 'reports.delete', 'reports.export',
  // Credits
  'credits.view', 'credits.grant', 'credits.revoke',
  // Analytics
  'analytics.view',
  // Settings
  'settings.view', 'settings.edit',
  // Feature Flags
  'flags.view', 'flags.edit',
  // Audit Logs
  'audit.view',
  // Roles
  'roles.view', 'roles.assign',
] as const;

export type Permission = typeof PERMISSIONS[number];

// ------------------------------------------------------------
// Permission Matrix
// ------------------------------------------------------------
const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS], // everything

  ADMIN: [
    'users.view', 'users.edit',
    'reports.view', 'reports.delete', 'reports.export',
    'credits.view', 'credits.grant', 'credits.revoke',
    'analytics.view',
    'settings.view', 'settings.edit',
    'flags.view', 'flags.edit',
    'audit.view',
    'roles.view',
  ],

  SUPPORT: [
    'users.view',
    'reports.view',
    'credits.view', 'credits.grant',
    'audit.view',
  ],

  ANALYST: [
    'analytics.view',
    'reports.view', 'reports.export',
    'audit.view',
  ],

  VIEWER: [
    'analytics.view',
    'reports.view',
    'audit.view',
  ],
};

// Role display metadata
export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  SUPPORT: 'Support',
  ANALYST: 'Analyst',
  VIEWER: 'Viewer',
};

// Higher = more powerful (for hierarchy checks)
export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  SUPPORT: 3,
  ANALYST: 2,
  VIEWER: 1,
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** Returns the list of permissions for a given role. */
export function getPermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Returns true if the given role has the specified permission. */
export function hasPermission(role: AdminRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns true if roleA is at least as powerful as roleB. */
export function isRoleAtLeast(roleA: AdminRole | null, roleB: AdminRole): boolean {
  if (!roleA) return false;
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

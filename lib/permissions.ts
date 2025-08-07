import { WorkspaceRole } from "./validation/workspace";

export const permissions: Record<string, WorkspaceRole[]> = {
  // workspace management
  "workspace:view": ["admin", "member", "viewer"],
  "workspace:update": ["admin", "member"],
  "workspace:delete": ["admin"],
  "workspace:regenerate_invite_code": ["admin", "member"],

  //   member management
  "members:view": ["admin", "member", "viewer"],
  "members:kick": ["admin"],
  "members:invite": ["admin"],
  "members:update_role": ["admin"],

  //   folder management
  "folders:view": ["admin", "member", "viewer"],
  "folders:create": ["admin", "member"],
  "folders:update": ["admin", "member"],
  "folders:delete": ["admin"],

  //   notes management
  "notes:create": ["admin", "member"],
  "notes:update": ["admin", "member"],
  "notes:delete": ["admin"],
  "notes:view": ["admin", "member", "viewer"],

  //   message managements
  "messages:send": ["admin", "member"],
  "messages:view": ["admin", "member", "viewer"],
  "messages:delete": ["admin"],
} as const;

type Permission = keyof typeof permissions;

export function hasPermission(
  userRole: WorkspaceRole,
  permission: Permission,
): boolean {
  return permissions[permission].includes(userRole);
}

export function requirePermission(
  userRole: WorkspaceRole,
  permission: Permission,
): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(
      `Insufficient Permission:${permission} required but user has role: ${userRole}`,
    );
  }
}

export function hasAnyPermission(
  userRole: WorkspaceRole,
  permissionList: Permission[],
): boolean {
  return permissionList.some((permission) =>
    hasPermission(userRole, permission),
  );
}

// get all permission for a role
export function getRolePermission(role: WorkspaceRole): Permission[] {
  return Object.entries(permissions)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission as Permission);
}

// role helper
export function isAdmin(role: WorkspaceRole): boolean {
  return role === "admin";
}

export function isMemberOrAbove(role: WorkspaceRole): boolean {
  return ["admin", "member"].includes(role);
}

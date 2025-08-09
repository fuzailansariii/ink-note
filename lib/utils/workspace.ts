// 6-character invitation code generation
export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/ * Sanitize workspace name */;
export function sanitizeWorkspaceName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/* Validate workspace member limit (if you want to add limits) */
export function canAddMoreMembers(
  currentMemberCount: number,
  maxMembers: number = 50,
): boolean {
  return currentMemberCount < maxMembers;
}

/* Format member count for display */
export function formatMemberCount(count: number): string {
  if (count === 1) return "1 member";
  return `${count} members`;
}

/* Get role display name*/
export function getRoleDisplayName(role: string): string {
  const roleNames = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };
  return roleNames[role as keyof typeof roleNames] || role;
}

/* Get role color/badge variant for UI*/
export function getRoleVariant(
  role: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "owner":
      return "destructive"; // Red/primary
    case "admin":
      return "default"; // Blue
    case "member":
      return "secondary"; // Gray
    case "viewer":
      return "outline"; // Light
    default:
      return "outline";
  }
}

import { auth } from "@clerk/nextjs/server";
import { getWorkspace, getWorkspaceMember } from "./workspace-helper";
import { hasPermission, requirePermission } from "../permissions";
import { WorkspaceRole } from "../validation/workspace";
import { NextRequest, NextResponse } from "next/server";

// get current user's workspace access info.
// return null if user is not authenticated or not a member

export const getWorkspaceAccess = async (workspaceId: string) => {
  const { userId } = await auth();
  if (!userId) return null;

  const member = await getWorkspaceMember(workspaceId, userId);
  if (!member) {
    return null;
  }

  return {
    userId,
    member,
    role: member.role as WorkspaceRole,
  };
};

// get workspace with user access info.
// throw error if user not have access.

export const getWorkspaceWithAccess = async (worksapceId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workspaceData = await getWorkspace(worksapceId, userId);
  if (!workspaceData) throw new Error("Workspace not found or access denied");

  return {
    userId,
    ...workspaceData,
  };
};

// requrie workspace access with specific permission
// throw error if user doesn't have the permission or access
export const requrieWorkspaceAccess = async (
  worksapceId: string,
  permission: keyof typeof import("../permissions").permissions,
) => {
  const access = await getWorkspaceAccess(worksapceId);
  if (!access) throw new Error("Workspace access denied");
  requirePermission(access.role, permission);
  return access;
};

// check if user has workspace permission (without throwing)
// return false if user doesn't have access
export const checkWorkspacePermission = async (
  worksapceId: string,
  permission: keyof typeof import("../permissions").permissions,
): Promise<boolean> => {
  try {
    const access = await getWorkspaceAccess(worksapceId);
    if (!access) {
      return false;
    }
    return hasPermission(access.role, permission);
  } catch {
    return false;
  }
};

//   Middleware for API routes - validates workspace access
//   Usage: const access = await validateWorkspaceAccess(workspaceId, 'workspace:view');

export async function validateWorkspaceAccess(
  workspaceId: string,
  permission: keyof typeof import("@/lib/permissions").permissions,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const member = await getWorkspaceMember(workspaceId, userId);

  if (!member) {
    throw new Error("Access denied: Not a workspace member");
  }

  const role = member.role as WorkspaceRole;

  if (!hasPermission(role, permission)) {
    throw new Error(`Access denied: Insufficient permissions (${permission})`);
  }

  return {
    userId,
    member,
    role,
  };
}

/**
 * Higher-order function for API route protection
 * Usage: export const GET = withWorkspaceAuth('workspace:view', async (request, { access, params }) => { ... });
 */
export function withWorkspaceAuth<T extends any[]>(
  permission: keyof typeof import("@/lib/permissions").permissions,
  handler: (
    request: NextRequest,
    context: {
      access: {
        userId: string;
        member: any;
        role: WorkspaceRole;
      };
      params: { workspaceId: string };
    },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    { params }: { params: { workspaceId: string } },
  ) => {
    try {
      const access = await validateWorkspaceAccess(
        params.workspaceId,
        permission,
      );

      return await handler(request, {
        access,
        params,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Access denied";

      if (message.includes("Authentication required")) {
        return new NextResponse(
          JSON.stringify({ error: "Authentication required" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (message.includes("Access denied")) {
        return new NextResponse(JSON.stringify({ error: message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new NextResponse(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}

/**
 * Server action wrapper for workspace protection
 */
export async function withWorkspacePermission<T extends any[], R>(
  workspaceId: string,
  permission: keyof typeof import("@/lib/permissions").permissions,
  action: (
    access: { userId: string; member: any; role: WorkspaceRole },
    ...args: T
  ) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    const access = await validateWorkspaceAccess(workspaceId, permission);
    return await action(access, ...args);
  };
}

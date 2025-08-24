import { withWorkspaceAuth } from "@/lib/dbHelper/workspace-auth";
import { getWorkspaceMembers } from "@/lib/dbHelper/workspace-helper";
import { NextResponse } from "next/server";

// Get all members of a workspace
export const GET = withWorkspaceAuth(
  "workspace:view",
  async (req, { access, params }) => {
    try {
      const members = await getWorkspaceMembers(params.workspaceId);

      // Add role hierarchy info for the current user
      const currentUserRole = access.role;
      const canManageMembers = ["admin"].includes(currentUserRole);

      // Enhance members data with management permissions
      const enhancedMembers = members.map((member) => ({
        ...member,
        canUpdateRole: currentUserRole === "admin" && member.role !== "admin",
        canRemove:
          canManageMembers &&
          member.userId !== access.userId &&
          member.role !== "admin",
      }));
      return NextResponse.json({
        members: enhancedMembers,
        totalCount: members.length,
        userPermission: {
          canUpdateRole: currentUserRole === "admin",
          canRemoveMember: canManageMembers,
          canInviteMembers: canManageMembers,
        },
        currentUser: {
          userId: access.userId,
          role: currentUserRole,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch workspace members" },
        { status: 500 },
      );
    }
  },
);

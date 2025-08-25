import { withWorkspaceAuth } from "@/lib/dbHelper/workspace-auth";
import {
  getWorkspaceMember,
  getWorkspaceMembers,
  removeMember,
  updateMemberRole,
} from "@/lib/dbHelper/workspace-helper";
import {
  updateMemberRoleSchema,
  WorkspaceRole,
} from "@/lib/validation/workspace";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  workspaceId: string;
  memberId: string;
}

// Update member role (only Admin can do this)
export const PUT = withWorkspaceAuth(
  "members:update_role",
  async (
    req: NextRequest,
    { access, params }: { access: any; params: RouteParams },
  ) => {
    try {
      const body = await req.json();
      const { role } = updateMemberRoleSchema.parse(body);
      if (access.role !== "admin") {
        return NextResponse.json(
          { error: "Only workspace admin can update member role" },
          { status: 403 },
        );
      }

      const targetMember = await getWorkspaceMember(params.workspaceId, "");
      const allMembers = await getWorkspaceMembers(params.workspaceId);
      const memberToUpdate = allMembers.find((m) => m.id === params.memberId);
      if (!memberToUpdate) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 },
        );
      }

      //   Prevent admin role change
      if (memberToUpdate.role === "admin") {
        return NextResponse.json(
          { error: "Cannot change the role of workspace admin " },
          { status: 400 },
        );
      }

      if (memberToUpdate.userId === access.userId && role !== "admin") {
        return NextResponse.json(
          {
            error:
              "Cannot change your own role as owner. Transfer ownership first.",
          },
          { status: 400 },
        );
      }

      //   update the member role
      const updatedMember = await updateMemberRole(
        params.workspaceId,
        params.memberId,
        role as WorkspaceRole,
      );
      return NextResponse.json({
        message: "Member role updated successfully",
        member: {
          id: updatedMember.id,
          role: updatedMember.role,
          userId: memberToUpdate.userId,
          user: memberToUpdate.user,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ZodError") {
        return NextResponse.json(
          { error: "Invalid role specified" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Failed to update member role" },
        { status: 500 },
      );
    }
  },
);

// Remove member from workspace (owners and admins can do this)
export const DELETE = withWorkspaceAuth(
  "workspace:delete",
  async (
    req: NextRequest,
    { access, params }: { access: any; params: RouteParams },
  ) => {
    try {
      const allMemebr = await getWorkspaceMembers(params.workspaceId);
      const memberToRemove = allMemebr.find((m) => m.id === params.memberId);
      if (!memberToRemove) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 },
        );
      }

      // Prevent removing workspace admin
      if (memberToRemove.role === "admin") {
        return NextResponse.json(
          { error: "Cannot remove workspace Admin" },
          { status: 400 },
        );
      }
      //   Prevent Removing yourself
      if (memberToRemove.userId === access.userId) {
        return NextResponse.json(
          { error: "You cannot remove yourself" },
          { status: 403 },
        );
      }
      //   Remove a member
      await removeMember(params.workspaceId, params.memberId);
      return NextResponse.json({
        message: "Member removed successfully",
        removedMember: {
          id: memberToRemove.id,
          userId: memberToRemove.userId,
          role: memberToRemove.role,
          user: memberToRemove.user,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 },
      );
    }
  },
);

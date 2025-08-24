import { withWorkspaceAuth } from "@/lib/dbHelper/workspace-auth";
import { regenerateInviteCode } from "@/lib/dbHelper/workspace-helper";
import { NextResponse } from "next/server";

// Regenerate workspace invite code (admins only)
export const POST = withWorkspaceAuth(
  "workspace:regenerate_invite_code",
  async (req, { access, params }) => {
    try {
      const updateInviteCode = await regenerateInviteCode(params.workspaceId);
      return NextResponse.json({
        message: "Invite code regenerated successfully",
        inviteCode: updateInviteCode.inviteCode,
        workspace: {
          id: updateInviteCode.id,
          name: updateInviteCode.name,
          inviteCode: updateInviteCode.inviteCode,
          updatedAt: updateInviteCode.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique")) {
        return NextResponse.json(
          { error: "Failed to generate unique invite code. Please try again." },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: "Failed to regenerate invite Code" },
        { status: 500 },
      );
    }
  },
);

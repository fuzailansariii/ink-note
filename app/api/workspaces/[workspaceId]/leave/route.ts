import { withWorkspaceAuth } from "@/lib/dbHelper/workspace-auth";
import {
  getMemberCount,
  removeUserFromWorkspace,
} from "@/lib/dbHelper/workspace-helper";
import { NextResponse } from "next/server";

// Leave a workspace (any member can leave, but owners need to transfer ownership first)
export const POST = withWorkspaceAuth(
  "workspace:view",
  async (request, { access, params }) => {
    try {
      // Prevent owner from leaving without transferring ownership
      if (access.role === "admin") {
        const memberCount = await getMemberCount(params.workspaceId);

        if (memberCount > 1) {
          return NextResponse.json(
            {
              error:
                "Workspace owners cannot leave while other members exist. Please transfer ownership or delete the workspace.",
            },
            { status: 400 },
          );
        }

        // If owner is the only member, they should delete the workspace instead
        return NextResponse.json(
          {
            error:
              "As the sole member and owner, you should delete the workspace instead of leaving.",
          },
          { status: 400 },
        );
      }

      // Remove user from workspace
      await removeUserFromWorkspace(params.workspaceId, access.userId);

      return NextResponse.json({
        message: "Successfully left the workspace",
        workspaceId: params.workspaceId,
        userId: access.userId,
      });
    } catch (error) {
      console.error("POST leave workspace error:", error);

      return NextResponse.json(
        { error: "Failed to leave workspace" },
        { status: 500 },
      );
    }
  },
);

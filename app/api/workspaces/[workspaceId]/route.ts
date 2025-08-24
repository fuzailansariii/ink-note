import { withWorkspaceAuth } from "@/lib/dbHelper/workspace-auth";
import {
  deleteWorkspace,
  getMemberCount,
  getWorkspaceMembers,
  updateWorkspace,
} from "@/lib/dbHelper/workspace-helper";
import { updateWorkspaceSchema } from "@/lib/validation/workspace";
import { NextResponse } from "next/server";

// GET workspace
export const GET = withWorkspaceAuth(
  "workspace:view",
  async (req, { access, params }) => {
    try {
      // Get workspace members and member count
      const [members, memberCount] = await Promise.all([
        getWorkspaceMembers(params.workspaceId),
        getMemberCount(params.workspaceId),
      ]);

      return NextResponse.json({
        workspace: access.member.workspace || {
          id: params.workspaceId,
        },
        members,
        memberCount,
        userRole: access.role,
        userId: access.userId,
      });
    } catch (error) {
      console.error("GET workspace details error:", error);

      return NextResponse.json(
        { error: "Failed to fetch workspace details" },
        { status: 500 },
      );
    }
  },
);

// Delete workspace
export const PUT = withWorkspaceAuth(
  "workspace:view",
  async (req, { access, params }) => {
    try {
      const data = await req.json();
      const parsedData = updateWorkspaceSchema.safeParse(data);
      if (!parsedData.success) {
        return NextResponse.json({ error: "Invalid Inputs" }, { status: 400 });
      }
      const updatedWorkspace = await updateWorkspace(
        params.workspaceId,
        parsedData.data,
      );
      return NextResponse.json(
        {
          message: "Workspace updated successfully",
          workspace: updatedWorkspace,
        },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof Error && error.message === "ZodError") {
        return NextResponse.json(
          {
            error: "Validation Failed",
            details: error.message,
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Failed to update workspace" },
        { status: 500 },
      );
    }
  },
);

// Delete workspace (only owners can do this)
export const DELETE = withWorkspaceAuth(
  "workspace:delete",
  async (req, { access, params }) => {
    try {
      if (access.role !== "admin") {
        return NextResponse.json(
          { error: "Only admin can delete workspace" },
          { status: 403 },
        );
      }
      await deleteWorkspace(params.workspaceId);
      return NextResponse.json({
        message: "Workspace deleted successfully",
        workspaceId: params.workspaceId,
      });
    } catch (error) {
      console.error("DELETE workspace error:", error);
      return NextResponse.json(
        { error: "Failed to delete workspace" },
        { status: 500 },
      );
    }
  },
);

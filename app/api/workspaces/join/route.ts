import {
  addUserToWorkspace,
  getWorkspaceByInviteCode,
  getWorkspaceMember,
  syncUserWithClerk,
} from "@/lib/dbHelper/workspace-helper";
import { joinWorkspaceCode } from "@/lib/validation/workspace";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = joinWorkspaceCode.safeParse(body);
    const inviteCode = parsedData.data?.inviteCode;
    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 },
      );
    }
    const workspace = await getWorkspaceByInviteCode(inviteCode);
    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid Invite Code, Please check the code and try again" },
        { status: 404 },
      );
    }

    // check if already a memeber
    const existingMember = await getWorkspaceMember(workspace.id, userId);
    if (existingMember) {
      return NextResponse.json(
        {
          error: "You are already a member of this workspace",
          workspace: {
            id: workspace.id,
            name: workspace.name,
            role: existingMember.role,
          },
        },
        { status: 409 },
      );
    }

    const clerkUser = await currentUser();
    if (clerkUser) {
      if (clerkUser) {
        await syncUserWithClerk({
          id: clerkUser.id,
          emailAddress: clerkUser.emailAddresses[0].emailAddress, // first email
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? undefined,
        });
      }
    }

    // Add user to workspace as member
    const newMember = await addUserToWorkspace({
      workspaceId: workspace.id,
      userId,
      role: "member",
    });

    return NextResponse.json(
      {
        message: `"Successfully Joined"${workspace.name}`,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          inviteCode: workspace.inviteCode,
        },
        member: {
          id: newMember.id,
          role: newMember.role,
          joinedAt: newMember.joinedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    // zod error
    if (error instanceof Error && error.message === "ZodError") {
      return NextResponse.json(
        { error: "Invalid Invite Code format" },
        { status: 400 },
      );
    }
    // duplicate member error
    if (error instanceof Error && error.message.includes("already a member")) {
      return NextResponse.json(
        {
          error: "You are already a member of this workspace",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to join workspace. Please try again" },
      { status: 500 },
    );
  }
}

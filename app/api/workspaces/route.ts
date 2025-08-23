import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createWorkspace,
  getUserWorkspace,
  syncUserWithClerk,
} from "@/lib/dbHelper/workspace-helper";
import { createWorkspaceSchema } from "@/lib/validation/workspace";

// To Get workspace
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    // workspaces
    const workspaces = await getUserWorkspace(userId);
    return NextResponse.json(
      { workspaces, count: workspaces.length },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}

// To create workspace
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          message: "Authentication required",
        },
        { status: 401 },
      );
    }
    const body = await req.json();
    const parsedData = createWorkspaceSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ message: "Invalid Inputs" }, { status: 408 });
    }
    const workspaceData = parsedData.data;

    const clerkUser = await currentUser();
    if (clerkUser) {
      await syncUserWithClerk({
        id: clerkUser.id,
        emailAddress: clerkUser.emailAddresses[0].emailAddress, // first email
        firstName: clerkUser.firstName ?? undefined,
        lastName: clerkUser.lastName ?? undefined,
        imageUrl: clerkUser.imageUrl ?? undefined,
      });
    }

    const workspace = await createWorkspace({
      name: workspaceData.name,
      description: workspaceData?.description,
      ownerId: userId,
    });
    return NextResponse.json(
      {
        message: "Workspace created successfully",
        workspace,
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }

    // Handle duplicate invite code (rare case)
    if (error instanceof Error && error.message.includes("unique")) {
      return Response.json(
        {
          error: "Failed to generate unique workspace code. Please try again.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}

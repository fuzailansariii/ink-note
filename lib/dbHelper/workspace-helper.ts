import { db } from "../db";
import { and, count, desc, eq } from "drizzle-orm";
import { users, workspaceMembers, workspaces } from "../db/schema";
import {
  WorkspaceMember,
  WorkspaceWithRole,
  WorkspaceRole,
} from "../validation/workspace";
import { generateInviteCode } from "../utils/workspace";

/** =============================================== WORKSPACE QUERY =============================================== */
/** ---------------------------getWorkspace With their role----------------------------- */
export async function getUserWorkspace(
  userId: string,
): Promise<WorkspaceWithRole[]> {
  const result = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(desc(workspaceMembers.joinedAt));

  return result.map((row) => ({
    workspce: row.workspace,
    role: row.role as WorkspaceRole,
    joinedAt: row.joinedAt,
  }));
}

/** ---------------------------getWorkspace by Id--------------------------- */
// (only if user is a member)
export async function getWorkspace(workspaceId: string, userId: string) {
  const result = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaces)
    .innerJoin(
      workspaceMembers,
      eq(workspaces.id, workspaceMembers.workspaceId),
    )
    .where(
      and(eq(workspaces.id, workspaceId), eq(workspaceMembers.userId, userId)),
    )
    .limit(1);

  if (result.length === 0) return null;

  return {
    workspace: result[0].workspace,
    role: result[0].role as WorkspaceRole,
    joinedAt: result[0].joinedAt,
  };
}

/** ---------------------------get workspace by invite code--------------------------- */
// to join workspace
export async function getWorkspaceByInviteCode(inviteCode: string) {
  const result = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.inviteCode, inviteCode))
    .limit(1);
  return result[0] || null;
}

// generate unique invite code -
async function generateUniqueInviteCode(
  maxAttempts: number = 20,
): Promise<string> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    // generate invite code
    const code = generateInviteCode();
    const existing = await getWorkspaceByInviteCode(code);

    if (!existing) return code;
    attempt++;
  }
  throw new Error(
    "Failed to generate unique invite code after maximum attempts",
  );
}

/** ---------------------------Create Workspace--------------------------- */
export async function createWorkspace(data: {
  name: string;
  description?: string;
  ownerId: string;
}) {
  const inviteCode = await generateUniqueInviteCode();

  return await db.transaction(async (tx) => {
    const [workspace] = await tx
      .insert(workspaces)
      .values({
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        inviteCode,
      })
      .returning();
    await tx.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: data.ownerId,
      role: "admin",
    });
    return workspace;
  });
}
/** ---------------------------Update Workspace--------------------------- */
export async function updateWorkspace(
  workspaceId: string,
  data: { name?: string; description?: string },
) {
  const [update] = await db
    .update(workspaces)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId))
    .returning();
  return update;
}

/** ---------------------------Delete Workspace--------------------------- */
export async function deleteWorkspace(workspaceId: string) {
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
}

/** ---------------------------Regenerate Workspace Invite Code--------------------------- */
export async function regenerateInviteCode(workspaceId: string) {
  const newInviteCode = await generateUniqueInviteCode();
  const [update] = await db
    .update(workspaces)
    .set({ inviteCode: newInviteCode, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId))
    .returning();
  if (!update) {
    throw new Error("Workspace not found");
  }
  return update;
}

/** =============================================== MEMBER QUERY =============================================== */
// get workspace Member by ID
export async function getWorkspaceMember(workspaceId: string, userId: string) {
  const result = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .limit(0);

  return result[0] || null;
}

// get all members of a workspace with user info

export async function getWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const result = await db
    .select({
      member: workspaceMembers,
      user: users,
    })
    .from(workspaceMembers)
    .leftJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(desc(workspaceMembers.joinedAt));

  return result.map((row) => ({
    id: row.member?.id,
    userId: row.member?.userId,
    role: row.member.role,
    joinedAt: row.member.joinedAt,
    invitedBy: row.member.invitedBy,
    user: row.user
      ? {
          email: row.user.email,
          profileData: row.user.profileData,
        }
      : undefined,
  }));
}

// get Member count for a workspace
export async function getMemberCount(workspaceId: string) {
  const result = await db
    .select({ count: count() })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  return result[0]?.count || 0;
}

// check if the user is admin of workspace
export async function isWorkspaceAdmin(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
    .limit(1);
  return result.length > 0;
}

// add new user to workspace
export async function addUserToWorkspace(data: {
  workspaceId: string;
  userId: string;
  role?: WorkspaceRole;
  invitedBy?: string;
}) {
  // check if the user is already a member
  const existingMember = await getWorkspaceMember(
    data.workspaceId,
    data.userId,
  );
  if (existingMember) {
    throw new Error("User already a member of this workspace");
  }
  // add to workspace
  const [member] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId: data.workspaceId,
      userId: data.userId,
      role: data.role || "member",
      invitedBy: data.invitedBy,
    })
    .returning();
  return member;
}

// update member role
export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  newRole: WorkspaceRole,
) {
  const [update] = await db
    .update(workspaceMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(workspaceMembers.id, memberId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .returning();
  return update;
}

// remove member form workspace
export async function removeMember(workspaceId: string, memberId: string) {
  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.id, memberId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    );
}

// remove user form workspace by userId
export async function removeUserFromWorkspace(
  worksapceId: string,
  userId: string,
) {
  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, worksapceId),
        eq(workspaceMembers.userId, userId),
      ),
    );
}

/** ============================= USER SYNC FUNCTIONS (for Clerk integration) ============================= */
export async function syncUserWithClerk(clerkUser: {
  id: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}) {
  const userData = {
    id: clerkUser.id,
    email: clerkUser.emailAddress,
    profileData: {
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      clerkId: clerkUser.id,
    },
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  // upsert user (insert or update)
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        profileData: userData.profileData,
        updatedAt: userData.updatedAt,
      },
    })
    .returning();
  return user;
}

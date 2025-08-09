import * as z from "zod";

export const nameValidation = z
  .string()
  .min(1, { message: "Workspace name is required" })
  .max(50, { message: "Workspace name must be less than 50 characters" })
  .trim();
export const descriptionValidation = z
  .string()
  .max(200, { message: "Description must be less than 200 characters" })
  .trim()
  .optional()
  .or(z.literal(""));

export const createWorkspaceSchema = z.object({
  name: nameValidation,
  description: descriptionValidation,
});

export const joinWorkspaceCode = z.object({
  inviteCode: z
    .string()
    .length(6, { message: "Invite code must be exactly 6 characters" })
    .regex(
      /^[A-Z0-9]+$/,
      "Invite code must contain only uppercase letters and numbers",
    )
    .transform((val) => val.toUpperCase()),
});

export const updateWorkspaceSchema = z.object({
  name: nameValidation.optional(),
  description: descriptionValidation,
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"], {
    error: "Role must be one of: admin, member, viewer",
  }),
});

export const workspaceRoles = ["admin", "member", "viewer"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

// response type
export type WorkspaceWithRole = {
  workspce: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
  };
  role: WorkspaceRole;
  joinedAt: Date;
};

// workspcememebr type
export type WorkspaceMember = {
  id: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  invitedBy: string | null;
  user?: {
    email: string;
    profileData: any;
  };
};

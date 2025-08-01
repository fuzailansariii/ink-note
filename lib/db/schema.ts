import { relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "member", "viewer"]);

// users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // clerk user id
  email: text("email").notNull().unique(),
  profileData: jsonb("profile_data"), // store clerk profile data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// workspace table
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().notNull(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// workspace members table
export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  invitedBy: uuid("invited_by").references(() => users.id),
});

// folders table
export const folders = pgTable("folders", {
  // id, workspaceId, name, parentFolderId, createdAt, updatedAt
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  parentFolderId: uuid("parent_folder_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// noted table
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  folderId: uuid("folder_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// message table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  replyTo: uuid("reply_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/*--------------------------------------------------------------------------------------------------------------------------------*/
// relations for better query

// user relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMembers: many(workspaceMembers),
  createdNotes: many(notes),
  sentMessages: many(messages),
}));

// workspace Relations
export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  folders: many(folders),
  notes: many(notes),
  messages: many(messages),
}));

// workspace members relations
export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.invitedBy],
      references: [users.id],
    }),
    inviter: one(users, {
      fields: [workspaceMembers.invitedBy],
      references: [users.id],
    }),
  })
);

// folder relations
export const folderRelations = relations(folders, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [folders.workspaceId],
    references: [workspaces.id],
  }),
  parentFolder: one(folders, {
    fields: [folders.parentFolderId],
    references: [folders.id],
  }),
  subFolders: many(folders, {
    relationName: "subFolders",
  }),
  notes: many(notes),
}));

// notes relations
export const notesRelations = relations(notes, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [notes.workspaceId],
    references: [workspaces.id],
  }),
  folder: one(folders, { fields: [notes.folderId], references: [folders.id] }),
  creator: one(users, { fields: [notes.createdBy], references: [users.id] }),
}));

// message Relations
export const messageRelations = relations(messages, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [messages.workspaceId],
    references: [workspaces.id],
  }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  replyToMessage: one(messages, {
    fields: [messages.replyTo],
    references: [messages.id],
  }),
  replies: many(messages),
}));

import { relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  PgTableWithColumns,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "member", "viewer"]);

// users table
export const users = pgTable("users", {
  id: text("id").primaryKey(), //clerk userId
  email: text("email").notNull().unique(),
  profileData: jsonb("profile_data"), // store clerk profile data including clerk id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// workspace table
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull(), //clerk userId
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// workspace members table
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), //clerk userId
    role: roleEnum("role").default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    invitedBy: text("invited_by"),
  },
  (table) => ({
    uniqueWorkspaceUser: unique().on(table.workspaceId, table.userId),
  }),
);

// folders table
export const folders: PgTableWithColumns<any> = pgTable("folders", {
  // id, workspaceId, name, parentFolderId, createdAt, updatedAt
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  parentFolderId: uuid("parent_folder_id").references(() => folders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// noted table
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  folderId: uuid("folder_id").references(() => folders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// message table
export const messages: PgTableWithColumns<any> = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  replyTo: uuid("reply_to").references(() => messages.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/*--------------------------------------------------------------------------------------------------------------------------------*/
// relations for better query

// user relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMembers: many(workspaceMembers, {
    relationName: "memberUser",
  }),
  invitedMembers: many(workspaceMembers, {
    relationName: "inviterUser",
  }),
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
      fields: [workspaceMembers.userId],
      references: [users.id],
      relationName: "memberUser",
    }),
    inviter: one(users, {
      fields: [workspaceMembers.invitedBy],
      references: [users.id],
      relationName: "inviterUser",
    }),
  }),
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
    relationName: "subFolders",
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
    relationName: "messageReplies",
  }),
  replies: many(messages, {
    relationName: "messageReplies",
  }),
}));

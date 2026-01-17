import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// --------------------
// User Table
// --------------------
export const user = sqliteTable(
  "user",
  {
    id: text("id", { length: 36 }).primaryKey(),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("user_email_uidx").on(table.email)],
);

// --------------------
// Session Table
// --------------------
export const session = sqliteTable(
  "session",
  {
    id: text("id", { length: 36 }).primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    userId: text("user_id", { length: 36 }).notNull(),
    activeOrganizationId: text("active_organization_id", { length: 36 }),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
    uniqueIndex("session_token_uidx").on(table.token),
  ],
);

// --------------------
// Account Table
// --------------------
export const account = sqliteTable(
  "account",
  {
    id: text("id", { length: 36 }).primaryKey(),
    accountId: text("account_id", { length: 255 }).notNull(),
    providerId: text("provider_id", { length: 255 }).notNull(),
    userId: text("user_id", { length: 36 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

// --------------------
// Verification Table
// --------------------
export const verification = sqliteTable(
  "verification",
  {
    id: text("id", { length: 36 }).primaryKey(),
    identifier: text("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// --------------------
// Organization Table
// --------------------
export const organization = sqliteTable(
  "organization",
  {
    id: text("id", { length: 36 }).primaryKey(),
    name: text("name", { length: 255 }).notNull(),
    slug: text("slug", { length: 255 }).notNull(),
    logo: text("logo"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

// --------------------
// Member Table
// --------------------
export const member = sqliteTable(
  "member",
  {
    id: text("id", { length: 36 }).primaryKey(),
    organizationId: text("organization_id", { length: 36 }).notNull(),
    userId: text("user_id", { length: 36 }).notNull(),
    role: text("role", { length: 255 }).notNull().default("member"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

// --------------------
// Invitation Table
// --------------------
export const invitation = sqliteTable(
  "invitation",
  {
    id: text("id", { length: 36 }).primaryKey(),
    organizationId: text("organization_id", { length: 36 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    role: text("role", { length: 255 }),
    status: text("status", { length: 255 }).notNull().default("pending"),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    inviterId: text("inviter_id", { length: 36 }).notNull(),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

// --------------------
// Relations
// --------------------
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

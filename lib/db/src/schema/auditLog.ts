import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorUserId: integer("actor_user_id").references(() => usersTable.id),
  actorName: text("actor_name"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLogEntry = typeof auditLogTable.$inferSelect;
export type InsertAuditLogEntry = typeof auditLogTable.$inferInsert;

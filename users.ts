import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoles = ["HRBP", "HR_DIRECTOR", "CHRO", "ADMIN"] as const;
export type UserRole = (typeof userRoles)[number];

// A user's business-unit scope is derived entirely from the
// `user_business_units` junction table (see ./userBusinessUnits.ts). There is
// deliberately no business_unit column here.
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(),
  // Seam for Microsoft Entra ID SSO; null for dev personas.
  entraObjectId: text("entra_object_id").unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

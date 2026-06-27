import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const businessUnitsTable = pgTable("business_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type BusinessUnit = typeof businessUnitsTable.$inferSelect;
export type InsertBusinessUnit = typeof businessUnitsTable.$inferInsert;

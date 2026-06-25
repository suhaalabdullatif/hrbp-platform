import { pgTable, integer, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { businessUnitsTable } from "./businessUnits";

// Junction table for the many-to-many relationship between users (HRBPs) and
// business units. A single HRBP may be assigned to multiple business units, and
// a business unit may have multiple HRBPs. This is the sole source of truth for
// a user's business-unit scope; there is no business_unit column on `users`.
export const userBusinessUnitsTable = pgTable(
  "user_business_units",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    businessUnitId: integer("business_unit_id")
      .notNull()
      .references(() => businessUnitsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.businessUnitId] })],
);

export type UserBusinessUnit = typeof userBusinessUnitsTable.$inferSelect;
export type InsertUserBusinessUnit =
  typeof userBusinessUnitsTable.$inferInsert;

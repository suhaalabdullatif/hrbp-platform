import {
  pgTable,
  serial,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { businessUnitsTable } from "./businessUnits";

export const attritionTable = pgTable("attrition", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  businessUnitId: integer("business_unit_id")
    .notNull()
    .references(() => businessUnitsTable.id),
  attritionType: text("attrition_type").notNull(),
  reason: text("reason"),
  exitDate: date("exit_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Attrition = typeof attritionTable.$inferSelect;
export type InsertAttrition = typeof attritionTable.$inferInsert;

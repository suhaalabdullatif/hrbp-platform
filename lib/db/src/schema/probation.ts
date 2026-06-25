import {
  pgTable,
  serial,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { businessUnitsTable } from "./businessUnits";

export const probationTable = pgTable("probation", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  businessUnitId: integer("business_unit_id")
    .notNull()
    .references(() => businessUnitsTable.id),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: text("status").notNull(),
  reviewDate: date("review_date", { mode: "string" }),
  outcome: text("outcome"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Probation = typeof probationTable.$inferSelect;
export type InsertProbation = typeof probationTable.$inferInsert;

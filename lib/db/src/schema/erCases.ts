import {
  pgTable,
  serial,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { businessUnitsTable } from "./businessUnits";

export const erCasesTable = pgTable("er_cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  employeeId: integer("employee_id"),
  businessUnitId: integer("business_unit_id")
    .notNull()
    .references(() => businessUnitsTable.id),
  caseType: text("case_type").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  openedDate: date("opened_date", { mode: "string" }).notNull(),
  closedDate: date("closed_date", { mode: "string" }),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type ErCase = typeof erCasesTable.$inferSelect;
export type InsertErCase = typeof erCasesTable.$inferInsert;

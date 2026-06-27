import {
  pgTable,
  serial,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { businessUnitsTable } from "./businessUnits";

export const requisitionsTable = pgTable("requisitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  businessUnitId: integer("business_unit_id")
    .notNull()
    .references(() => businessUnitsTable.id),
  status: text("status").notNull(),
  grade: text("grade").notNull(),
  openedDate: date("opened_date", { mode: "string" }).notNull(),
  targetCloseDate: date("target_close_date", { mode: "string" }),
  filledDate: date("filled_date", { mode: "string" }),
  recruiter: text("recruiter").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Requisition = typeof requisitionsTable.$inferSelect;
export type InsertRequisition = typeof requisitionsTable.$inferInsert;

import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { businessUnitsTable } from "./businessUnits";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeNumber: text("employee_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  gender: text("gender").notNull(),
  isSaudi: boolean("is_saudi").notNull(),
  businessUnitId: integer("business_unit_id")
    .notNull()
    .references(() => businessUnitsTable.id),
  jobTitle: text("job_title").notNull(),
  grade: text("grade").notNull(),
  employmentStatus: text("employment_status").notNull(),
  hireDate: date("hire_date", { mode: "string" }).notNull(),
  terminationDate: date("termination_date", { mode: "string" }),
  managerId: integer("manager_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Employee = typeof employeesTable.$inferSelect;
export type InsertEmployee = typeof employeesTable.$inferInsert;

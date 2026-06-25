import { eq, and, inArray, type SQL } from "drizzle-orm";
import {
  db,
  employeesTable,
  requisitionsTable,
  erCasesTable,
  attritionTable,
} from "@workspace/db";

export interface Kpis {
  headcount: number;
  saudizationPct: number;
  femalePct: number;
  openRoles: number;
  attritionPct: number;
  openErCases: number;
}

function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// `buIds == null` means no business-unit restriction (global scope). An empty
// array would match nothing, so callers must pass null for "all".
function buFilter(
  column: Parameters<typeof inArray>[0],
  buIds: number[] | null,
): SQL | undefined {
  return buIds == null ? undefined : inArray(column, buIds);
}

export async function computeKpis(buIds: number[] | null): Promise<Kpis> {
  const employees = await db
    .select({
      isSaudi: employeesTable.isSaudi,
      gender: employeesTable.gender,
      status: employeesTable.employmentStatus,
    })
    .from(employeesTable)
    .where(buFilter(employeesTable.businessUnitId, buIds));

  const active = employees.filter((e) => e.status !== "terminated");
  const headcount = active.length;
  const saudi = active.filter((e) => e.isSaudi).length;
  const female = active.filter((e) => e.gender === "F").length;

  const openReqs = await db
    .select({ id: requisitionsTable.id })
    .from(requisitionsTable)
    .where(
      and(
        eq(requisitionsTable.status, "open"),
        buFilter(requisitionsTable.businessUnitId, buIds),
      ),
    );

  const erRows = await db
    .select({ status: erCasesTable.status })
    .from(erCasesTable)
    .where(buFilter(erCasesTable.businessUnitId, buIds));
  const openEr = erRows.filter(
    (e) => e.status === "open" || e.status === "in_progress",
  ).length;

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffStr = ymd(cutoff);
  const exits = await db
    .select({ exitDate: attritionTable.exitDate })
    .from(attritionTable)
    .where(buFilter(attritionTable.businessUnitId, buIds));
  const recentExits = exits.filter((e) => e.exitDate >= cutoffStr).length;

  return {
    headcount,
    saudizationPct: pct(saudi, headcount),
    femalePct: pct(female, headcount),
    openRoles: openReqs.length,
    attritionPct: pct(recentExits, headcount),
    openErCases: openEr,
  };
}

export interface TrendPoint {
  month: string;
  headcount: number;
  exits: number;
}

export async function computeTrends(
  buIds: number[] | null,
): Promise<TrendPoint[]> {
  const employees = await db
    .select({
      hireDate: employeesTable.hireDate,
      terminationDate: employeesTable.terminationDate,
    })
    .from(employeesTable)
    .where(buFilter(employeesTable.businessUnitId, buIds));

  const exits = await db
    .select({ exitDate: attritionTable.exitDate })
    .from(attritionTable)
    .where(buFilter(attritionTable.businessUnitId, buIds));

  const points: TrendPoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
    );
    const monthStartStr = ymd(monthDate);
    const monthEndStr = ymd(monthEnd);
    const label = monthDate.toISOString().slice(0, 7);

    const headcount = employees.filter(
      (e) =>
        e.hireDate <= monthEndStr &&
        (e.terminationDate == null || e.terminationDate > monthEndStr),
    ).length;

    const monthExits = exits.filter(
      (e) => e.exitDate >= monthStartStr && e.exitDate <= monthEndStr,
    ).length;

    points.push({ month: label, headcount, exits: monthExits });
  }

  return points;
}

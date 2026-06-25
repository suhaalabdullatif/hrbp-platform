import { Router, type IRouter } from "express";
import { asc, eq, and, type SQL } from "drizzle-orm";
import {
  db,
  businessUnitsTable,
  erCasesTable,
  requisitionsTable,
  probationTable,
} from "@workspace/db";
import { ListNotificationsResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { getScope } from "../lib/auth/scope";
import { computeKpis } from "../lib/metrics";

const router: IRouter = Router();

type Severity = "info" | "warning" | "critical";

interface Alert {
  id: string;
  type: string;
  severity: Severity;
  title: string;
  message: string;
  businessUnitId: number | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  date: string | null;
}

const SAUDIZATION_FLOOR = 30;
const ATTRITION_CEILING = 15;
const PROBATION_WINDOW_DAYS = 14;
const REQ_AGING_DAYS = 60;

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24),
  );
}

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const scope = getScope(req.auth!);
  const today = new Date().toISOString().slice(0, 10);

  const units = await db
    .select()
    .from(businessUnitsTable)
    .where(
      scope.canSeeAll || scope.businessUnitId == null
        ? undefined
        : eq(businessUnitsTable.id, scope.businessUnitId),
    )
    .orderBy(asc(businessUnitsTable.name));

  const scopedUnits = scope.canSeeAll
    ? units
    : units.filter((u) => u.id === scope.businessUnitId);

  const alerts: Alert[] = [];

  for (const bu of scopedUnits) {
    const kpis = await computeKpis(bu.id);
    if (kpis.headcount > 0 && kpis.saudizationPct < SAUDIZATION_FLOOR) {
      alerts.push({
        id: `saudization-${bu.id}`,
        type: "saudization",
        severity: "warning",
        title: "Low Saudization",
        message: `${bu.name} Saudization is ${kpis.saudizationPct}%, below the ${SAUDIZATION_FLOOR}% target.`,
        businessUnitId: bu.id,
        relatedEntityType: "business_unit",
        relatedEntityId: bu.id,
        date: today,
      });
    }
    if (kpis.headcount > 0 && kpis.attritionPct > ATTRITION_CEILING) {
      alerts.push({
        id: `attrition-${bu.id}`,
        type: "attrition",
        severity: "critical",
        title: "High Attrition",
        message: `${bu.name} attrition is ${kpis.attritionPct}% over the trailing year, above the ${ATTRITION_CEILING}% threshold.`,
        businessUnitId: bu.id,
        relatedEntityType: "business_unit",
        relatedEntityId: bu.id,
        date: today,
      });
    }
  }

  const buScopeCond: SQL | undefined =
    scope.canSeeAll || scope.businessUnitId == null
      ? undefined
      : eq(erCasesTable.businessUnitId, scope.businessUnitId);
  const erRows = await db
    .select()
    .from(erCasesTable)
    .where(
      buScopeCond
        ? and(eq(erCasesTable.severity, "high"), buScopeCond)
        : eq(erCasesTable.severity, "high"),
    );
  for (const c of erRows) {
    if (c.status === "open" || c.status === "in_progress") {
      alerts.push({
        id: `er-case-${c.id}`,
        type: "er_case",
        severity: "critical",
        title: "High-severity ER case open",
        message: `Case ${c.caseNumber} is ${c.status.replace("_", " ")}.`,
        businessUnitId: c.businessUnitId,
        relatedEntityType: "er_case",
        relatedEntityId: c.id,
        date: c.openedDate,
      });
    }
  }

  const reqScopeCond: SQL | undefined =
    scope.canSeeAll || scope.businessUnitId == null
      ? undefined
      : eq(requisitionsTable.businessUnitId, scope.businessUnitId);
  const reqRows = await db
    .select()
    .from(requisitionsTable)
    .where(
      reqScopeCond
        ? and(eq(requisitionsTable.status, "open"), reqScopeCond)
        : eq(requisitionsTable.status, "open"),
    );
  for (const r of reqRows) {
    if (daysBetween(today, r.openedDate) > REQ_AGING_DAYS) {
      alerts.push({
        id: `req-aging-${r.id}`,
        type: "requisition_aging",
        severity: "warning",
        title: "Requisition aging",
        message: `"${r.title}" has been open for ${daysBetween(today, r.openedDate)} days.`,
        businessUnitId: r.businessUnitId,
        relatedEntityType: "requisition",
        relatedEntityId: r.id,
        date: r.openedDate,
      });
    }
  }

  const probScopeCond: SQL | undefined =
    scope.canSeeAll || scope.businessUnitId == null
      ? undefined
      : eq(probationTable.businessUnitId, scope.businessUnitId);
  const probRows = await db
    .select()
    .from(probationTable)
    .where(
      probScopeCond
        ? and(eq(probationTable.status, "pending"), probScopeCond)
        : eq(probationTable.status, "pending"),
    );
  for (const p of probRows) {
    const remaining = daysBetween(p.endDate, today);
    if (remaining >= 0 && remaining <= PROBATION_WINDOW_DAYS) {
      alerts.push({
        id: `probation-${p.id}`,
        type: "probation_ending",
        severity: "info",
        title: "Probation ending soon",
        message: `A probation review is due in ${remaining} day(s).`,
        businessUnitId: p.businessUnitId,
        relatedEntityType: "probation",
        relatedEntityId: p.id,
        date: p.endDate,
      });
    }
  }

  const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  res.json(ListNotificationsResponse.parse(alerts));
});

export default router;

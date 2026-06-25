import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, businessUnitsTable } from "@workspace/db";
import {
  GetDashboardKpisQueryParams,
  GetDashboardKpisResponse,
  GetDashboardComparisonResponse,
  GetDashboardTrendsQueryParams,
  GetDashboardTrendsResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getScope, resolveBusinessUnitFilter } from "../lib/auth/scope";
import { computeKpis, computeTrends } from "../lib/metrics";

const router: IRouter = Router();

router.get("/dashboard/kpis", requireAuth, async (req, res): Promise<void> => {
  const query = GetDashboardKpisQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  const filter = resolveBusinessUnitFilter(scope, query.data.businessUnitId);
  if (filter === "none") {
    res.json(
      GetDashboardKpisResponse.parse({
        headcount: 0,
        saudizationPct: 0,
        femalePct: 0,
        openRoles: 0,
        attritionPct: 0,
        openErCases: 0,
      }),
    );
    return;
  }

  const buId = filter === "all" ? null : filter;
  res.json(GetDashboardKpisResponse.parse(await computeKpis(buId)));
});

router.get(
  "/dashboard/comparison",
  requireAuth,
  requireRole("HR_DIRECTOR", "CHRO", "ADMIN"),
  async (_req, res): Promise<void> => {
    const units = await db
      .select()
      .from(businessUnitsTable)
      .orderBy(asc(businessUnitsTable.name));

    const result = await Promise.all(
      units.map(async (bu) => ({
        businessUnitId: bu.id,
        businessUnitName: bu.name,
        ...(await computeKpis(bu.id)),
      })),
    );

    res.json(GetDashboardComparisonResponse.parse(result));
  },
);

router.get("/dashboard/trends", requireAuth, async (req, res): Promise<void> => {
  const query = GetDashboardTrendsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const scope = getScope(req.auth!);
  const filter = resolveBusinessUnitFilter(scope, query.data.businessUnitId);
  if (filter === "none") {
    res.json([]);
    return;
  }

  const buId = filter === "all" ? null : filter;
  res.json(GetDashboardTrendsResponse.parse(await computeTrends(buId)));
});

export default router;

import { Router, type IRouter } from "express";
import {
  GetIntelligenceHealthScoresQueryParams,
  GetIntelligenceHealthScoresResponse,
  GetIntelligenceRiskQueryParams,
  GetIntelligenceRiskResponse,
  GetIntelligenceBenchmarkingResponse,
  GetIntelligenceInsightsQueryParams,
  GetIntelligenceInsightsResponse,
  GetIntelligenceContextQueryParams,
  GetIntelligenceContextResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getScope, resolveBusinessUnitFilter } from "../lib/auth/scope";
import {
  getHealthScores,
  getRiskProfiles,
  getBenchmarking,
  buildWorkforceContext,
} from "../lib/intelligence/engine";
import { getInsightProvider } from "../lib/intelligence/insights";

const router: IRouter = Router();

// Resolves the BU id list for a scope-aware request, or null when the request
// should return an empty result set.
function scopeToBuIds(
  scope: ReturnType<typeof getScope>,
  requested: number | undefined,
): number[] | null | "empty" {
  const filter = resolveBusinessUnitFilter(scope, requested);
  if (filter === "none") return "empty";
  if (filter === "all") return null;
  return filter;
}

router.get(
  "/intelligence/health-scores",
  requireAuth,
  async (req, res): Promise<void> => {
    const query = GetIntelligenceHealthScoresQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }
    const scope = getScope(req.auth!);
    const buIds = scopeToBuIds(scope, query.data.businessUnitId);
    if (buIds === "empty") {
      res.json(GetIntelligenceHealthScoresResponse.parse([]));
      return;
    }
    res.json(
      GetIntelligenceHealthScoresResponse.parse(await getHealthScores(buIds)),
    );
  },
);

router.get(
  "/intelligence/risk",
  requireAuth,
  async (req, res): Promise<void> => {
    const query = GetIntelligenceRiskQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }
    const scope = getScope(req.auth!);
    const buIds = scopeToBuIds(scope, query.data.businessUnitId);
    if (buIds === "empty") {
      res.json(GetIntelligenceRiskResponse.parse([]));
      return;
    }
    res.json(GetIntelligenceRiskResponse.parse(await getRiskProfiles(buIds)));
  },
);

router.get(
  "/intelligence/benchmarking",
  requireAuth,
  requireRole("HR_DIRECTOR", "CHRO", "ADMIN"),
  async (_req, res): Promise<void> => {
    res.json(GetIntelligenceBenchmarkingResponse.parse(await getBenchmarking()));
  },
);

router.get(
  "/intelligence/insights",
  requireAuth,
  async (req, res): Promise<void> => {
    const query = GetIntelligenceInsightsQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }
    const scope = getScope(req.auth!);
    const buIds = scopeToBuIds(scope, query.data.businessUnitId);
    if (buIds === "empty") {
      res.json(GetIntelligenceInsightsResponse.parse([]));
      return;
    }
    const context = await buildWorkforceContext(buIds, scope.canSeeAll);
    const insights = await getInsightProvider().generateExecutiveInsights(
      context,
    );
    res.json(GetIntelligenceInsightsResponse.parse(insights));
  },
);

router.get(
  "/intelligence/context",
  requireAuth,
  async (req, res): Promise<void> => {
    const query = GetIntelligenceContextQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }
    const scope = getScope(req.auth!);
    const buIds = scopeToBuIds(scope, query.data.businessUnitId);
    if (buIds === "empty") {
      const empty = await buildWorkforceContext([], scope.canSeeAll);
      res.json(GetIntelligenceContextResponse.parse(empty));
      return;
    }
    const context = await buildWorkforceContext(buIds, scope.canSeeAll);
    res.json(GetIntelligenceContextResponse.parse(context));
  },
);

export default router;

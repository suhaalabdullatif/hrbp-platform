import { inArray, asc, type SQL } from "drizzle-orm";
import {
  db,
  businessUnitsTable,
  employeesTable,
  requisitionsTable,
  erCasesTable,
  attritionTable,
  probationTable,
} from "@workspace/db";
import { computeKpis, computeTrends, type Kpis, type TrendPoint } from "../metrics";

/*
  Deterministic workforce-intelligence engine.

  Everything here is computed from the existing operational tables — there are no
  AI calls and no extra storage. The output is also the substrate the pluggable
  insight provider (and any future LLM) consumes: see WorkforceContext.

  Tunable policy thresholds live in one place so scoring stays explainable.
*/
export const POLICY = {
  saudizationTargetPct: 60,
  femaleTargetPct: 30,
  agingRequisitionDays: 60,
  slowTimeToFillDays: 90,
  probationEndingSoonDays: 30,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskLevel = "low" | "moderate" | "elevated" | "high";
export type HealthRating = "Excellent" | "Good" | "Fair" | "At Risk";
export type Severity = "low" | "medium" | "high";

export interface SubScore {
  key: string;
  label: string;
  score: number; // 0-100, higher = healthier
  weight: number;
  value: string; // human-readable underlying value
}

export interface HealthScore {
  businessUnitId: number;
  businessUnitName: string;
  headcount: number;
  score: number; // 0-100
  rating: HealthRating;
  subScores: SubScore[];
}

export interface RiskSignal {
  label: string;
  detail: string;
  severity: Severity;
}

export interface RiskMetric {
  score: number; // 0-100, higher = more risk
  level: RiskLevel;
  signals: RiskSignal[];
}

export interface RiskProfile {
  businessUnitId: number;
  businessUnitName: string;
  headcount: number;
  workforceRisk: RiskMetric;
  attritionRisk: RiskMetric;
  recruitmentRisk: RiskMetric;
  employeeRelationsRisk: RiskMetric;
}

export interface BenchmarkRow {
  businessUnitId: number;
  businessUnitName: string;
  value: number;
  rank: number;
  percentile: number;
}

export interface BenchmarkMetric {
  key: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  orgAverage: number;
  orgMedian: number;
  best: { businessUnitId: number; businessUnitName: string; value: number } | null;
  worst: { businessUnitId: number; businessUnitName: string; value: number } | null;
  rows: BenchmarkRow[];
}

export interface Benchmarking {
  generatedAt: string;
  businessUnitCount: number;
  metrics: BenchmarkMetric[];
}

export interface BusinessUnitFacts {
  headcount: number;
  saudiPct: number;
  femalePct: number;
  attritionPct: number;
  exitsLast12mo: number;
  exitsRecent3mo: number;
  exitsPrior3mo: number;
  voluntarySharePct: number;
  openRoles: number;
  agingRequisitions: number;
  avgTimeToFillDays: number | null;
  openErCases: number;
  highSeverityOpenErCases: number;
  probationEndingSoon: number;
  probationFailRatePct: number;
}

export interface BusinessUnitContext {
  businessUnitId: number;
  businessUnitName: string;
  kpis: Kpis;
  facts: BusinessUnitFacts;
  healthScore: number;
  healthRating: HealthRating;
  risk: {
    workforce: { score: number; level: RiskLevel };
    attrition: { score: number; level: RiskLevel };
    recruitment: { score: number; level: RiskLevel };
    employeeRelations: { score: number; level: RiskLevel };
  };
}

export interface WorkforceContext {
  generatedAt: string;
  policy: typeof POLICY;
  scope: { canSeeAll: boolean; businessUnitIds: number[] };
  org: {
    businessUnitCount: number;
    totalHeadcount: number;
    kpis: Kpis;
    trends: TrendPoint[];
    averageHealthScore: number;
  };
  businessUnits: BusinessUnitContext[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const round1 = (n: number): number => Math.round(n * 10) / 10;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.round((b - a) / 86_400_000);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function riskLevel(score: number): RiskLevel {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 70) return "elevated";
  return "high";
}

function healthRating(score: number): HealthRating {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  return "At Risk";
}

function buFilter(column: unknown, buIds: number[] | null): SQL | undefined {
  return buIds == null ? undefined : inArray(column as never, buIds);
}

// ---------------------------------------------------------------------------
// Fact loading
// ---------------------------------------------------------------------------

interface BuRow {
  id: number;
  name: string;
}

async function loadBusinessUnits(buIds: number[] | null): Promise<BuRow[]> {
  const rows = await db
    .select({ id: businessUnitsTable.id, name: businessUnitsTable.name })
    .from(businessUnitsTable)
    .where(buFilter(businessUnitsTable.id, buIds))
    .orderBy(asc(businessUnitsTable.name));
  return rows;
}

async function loadFacts(
  buIds: number[] | null,
): Promise<Map<number, BusinessUnitFacts>> {
  const units = await loadBusinessUnits(buIds);
  const ids = units.map((u) => u.id);
  const idSet = new Set(ids);

  const [employees, requisitions, erCases, attrition, probation] =
    await Promise.all([
      db
        .select({
          businessUnitId: employeesTable.businessUnitId,
          isSaudi: employeesTable.isSaudi,
          gender: employeesTable.gender,
          status: employeesTable.employmentStatus,
        })
        .from(employeesTable)
        .where(buFilter(employeesTable.businessUnitId, buIds)),
      db
        .select({
          businessUnitId: requisitionsTable.businessUnitId,
          status: requisitionsTable.status,
          openedDate: requisitionsTable.openedDate,
          filledDate: requisitionsTable.filledDate,
        })
        .from(requisitionsTable)
        .where(buFilter(requisitionsTable.businessUnitId, buIds)),
      db
        .select({
          businessUnitId: erCasesTable.businessUnitId,
          severity: erCasesTable.severity,
          status: erCasesTable.status,
        })
        .from(erCasesTable)
        .where(buFilter(erCasesTable.businessUnitId, buIds)),
      db
        .select({
          businessUnitId: attritionTable.businessUnitId,
          attritionType: attritionTable.attritionType,
          exitDate: attritionTable.exitDate,
        })
        .from(attritionTable)
        .where(buFilter(attritionTable.businessUnitId, buIds)),
      db
        .select({
          businessUnitId: probationTable.businessUnitId,
          status: probationTable.status,
          endDate: probationTable.endDate,
          outcome: probationTable.outcome,
        })
        .from(probationTable)
        .where(buFilter(probationTable.businessUnitId, buIds)),
    ]);

  const now = new Date();
  const today = ymd(now);
  const cutoff12 = ymd(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
  const cutoff3 = ymd(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
  const cutoff6 = ymd(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
  const agingCutoff = ymd(
    new Date(now.getTime() - POLICY.agingRequisitionDays * 86_400_000),
  );
  const endingSoonCutoff = ymd(
    new Date(now.getTime() + POLICY.probationEndingSoonDays * 86_400_000),
  );

  const result = new Map<number, BusinessUnitFacts>();

  for (const u of units) {
    const emp = employees.filter((e) => e.businessUnitId === u.id);
    const active = emp.filter((e) => e.status !== "terminated");
    const headcount = active.length;
    const saudi = active.filter((e) => e.isSaudi).length;
    const female = active.filter((e) => e.gender === "F").length;

    const reqs = requisitions.filter((r) => r.businessUnitId === u.id);
    const openReqs = reqs.filter((r) => r.status === "open");
    const agingReqs = openReqs.filter(
      (r) => r.openedDate != null && r.openedDate <= agingCutoff,
    ).length;
    const filledRecent = reqs.filter(
      (r) =>
        r.filledDate != null &&
        r.openedDate != null &&
        r.filledDate >= cutoff12,
    );
    const fillDays = filledRecent.map((r) =>
      daysBetween(r.openedDate!, r.filledDate!),
    );
    const avgTimeToFill =
      fillDays.length > 0
        ? Math.round(fillDays.reduce((a, b) => a + b, 0) / fillDays.length)
        : null;

    const er = erCases.filter((c) => c.businessUnitId === u.id);
    const openEr = er.filter(
      (c) => c.status === "open" || c.status === "in_progress",
    );
    const highSeverityOpenEr = openEr.filter(
      (c) => c.severity === "high",
    ).length;

    const exits = attrition.filter((a) => a.businessUnitId === u.id);
    const exits12 = exits.filter((e) => e.exitDate >= cutoff12);
    const exitsRecent3 = exits.filter((e) => e.exitDate >= cutoff3).length;
    const exitsPrior3 = exits.filter(
      (e) => e.exitDate >= cutoff6 && e.exitDate < cutoff3,
    ).length;
    const voluntary = exits12.filter(
      (e) => e.attritionType === "voluntary",
    ).length;

    const prob = probation.filter((p) => p.businessUnitId === u.id);
    const endingSoon = prob.filter(
      (p) =>
        p.status === "active" &&
        p.endDate != null &&
        p.endDate >= today &&
        p.endDate <= endingSoonCutoff,
    ).length;
    const completed = prob.filter((p) => p.outcome != null);
    const failed = completed.filter((p) => p.outcome === "failed").length;

    result.set(u.id, {
      headcount,
      saudiPct: headcount === 0 ? 0 : round1((saudi / headcount) * 100),
      femalePct: headcount === 0 ? 0 : round1((female / headcount) * 100),
      attritionPct:
        headcount === 0 ? 0 : round1((exits12.length / headcount) * 100),
      exitsLast12mo: exits12.length,
      exitsRecent3mo: exitsRecent3,
      exitsPrior3mo: exitsPrior3,
      voluntarySharePct:
        exits12.length === 0
          ? 0
          : round1((voluntary / exits12.length) * 100),
      openRoles: openReqs.length,
      agingRequisitions: agingReqs,
      avgTimeToFillDays: avgTimeToFill,
      openErCases: openEr.length,
      highSeverityOpenErCases: highSeverityOpenEr,
      probationEndingSoon: endingSoon,
      probationFailRatePct:
        completed.length === 0
          ? 0
          : round1((failed / completed.length) * 100),
    });
  }

  // Guarantee every requested BU is present even with no related rows.
  for (const id of idSet) {
    if (!result.has(id)) {
      result.set(id, {
        headcount: 0,
        saudiPct: 0,
        femalePct: 0,
        attritionPct: 0,
        exitsLast12mo: 0,
        exitsRecent3mo: 0,
        exitsPrior3mo: 0,
        voluntarySharePct: 0,
        openRoles: 0,
        agingRequisitions: 0,
        avgTimeToFillDays: null,
        openErCases: 0,
        highSeverityOpenErCases: 0,
        probationEndingSoon: 0,
        probationFailRatePct: 0,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function computeSubScores(f: BusinessUnitFacts): SubScore[] {
  const saudization = clamp((f.saudiPct / POLICY.saudizationTargetPct) * 100);
  const retention = clamp(100 - f.attritionPct * 5);
  const diversity = clamp((f.femalePct / POLICY.femaleTargetPct) * 100);
  const erRate = f.headcount === 0 ? 0 : (f.openErCases / f.headcount) * 100;
  const employeeRelations = clamp(
    100 - erRate * 20 - f.highSeverityOpenErCases * 8,
  );
  const agingRatio =
    f.openRoles === 0 ? 0 : f.agingRequisitions / f.openRoles;
  const vacancyRate =
    f.headcount + f.openRoles === 0
      ? 0
      : f.openRoles / (f.headcount + f.openRoles);
  const recruitment = clamp(100 - agingRatio * 70 - vacancyRate * 100 * 0.4);

  return [
    {
      key: "saudization",
      label: "Saudization",
      score: saudization,
      weight: 0.25,
      value: `${f.saudiPct}% (target ${POLICY.saudizationTargetPct}%)`,
    },
    {
      key: "retention",
      label: "Retention",
      score: retention,
      weight: 0.3,
      value: `${f.attritionPct}% attrition`,
    },
    {
      key: "diversity",
      label: "Diversity",
      score: diversity,
      weight: 0.15,
      value: `${f.femalePct}% female (target ${POLICY.femaleTargetPct}%)`,
    },
    {
      key: "employee_relations",
      label: "Employee Relations",
      score: employeeRelations,
      weight: 0.15,
      value: `${f.openErCases} open (${f.highSeverityOpenErCases} high severity)`,
    },
    {
      key: "recruitment",
      label: "Recruitment",
      score: recruitment,
      weight: 0.15,
      value: `${f.openRoles} open, ${f.agingRequisitions} aging`,
    },
  ];
}

function computeHealth(
  buId: number,
  buName: string,
  f: BusinessUnitFacts,
): HealthScore {
  const subScores = computeSubScores(f);
  const score = clamp(
    subScores.reduce((sum, s) => sum + s.score * s.weight, 0),
  );
  return {
    businessUnitId: buId,
    businessUnitName: buName,
    headcount: f.headcount,
    score,
    rating: healthRating(score),
    subScores,
  };
}

function computeAttritionRisk(f: BusinessUnitFacts): RiskMetric {
  let score = f.attritionPct * 5;
  const signals: RiskSignal[] = [];

  signals.push({
    label: "Annual attrition",
    detail: `${f.attritionPct}% over the last 12 months (${f.exitsLast12mo} exits)`,
    severity: f.attritionPct >= 15 ? "high" : f.attritionPct >= 8 ? "medium" : "low",
  });

  if (f.exitsPrior3mo > 0 && f.exitsRecent3mo > f.exitsPrior3mo * 1.2) {
    score += 15;
    signals.push({
      label: "Accelerating exits",
      detail: `Recent quarter exits (${f.exitsRecent3mo}) up from prior quarter (${f.exitsPrior3mo})`,
      severity: "high",
    });
  } else if (f.exitsRecent3mo > 0 && f.exitsRecent3mo < f.exitsPrior3mo) {
    signals.push({
      label: "Slowing exits",
      detail: `Recent quarter exits (${f.exitsRecent3mo}) down from prior quarter (${f.exitsPrior3mo})`,
      severity: "low",
    });
  }

  if (f.voluntarySharePct >= 60 && f.exitsLast12mo >= 3) {
    score += 10;
    signals.push({
      label: "Voluntary-driven",
      detail: `${f.voluntarySharePct}% of exits were voluntary — a regrettable-loss signal`,
      severity: "medium",
    });
  }

  const s = clamp(score);
  return { score: s, level: riskLevel(s), signals };
}

function computeRecruitmentRisk(f: BusinessUnitFacts): RiskMetric {
  const agingRatio =
    f.openRoles === 0 ? 0 : f.agingRequisitions / f.openRoles;
  const vacancyRate =
    f.headcount + f.openRoles === 0
      ? 0
      : f.openRoles / (f.headcount + f.openRoles);
  let score = agingRatio * 60 + vacancyRate * 100 * 0.5;
  const signals: RiskSignal[] = [];

  signals.push({
    label: "Open roles",
    detail: `${f.openRoles} open requisitions (${(vacancyRate * 100).toFixed(1)}% vacancy rate)`,
    severity: vacancyRate >= 0.12 ? "high" : vacancyRate >= 0.06 ? "medium" : "low",
  });

  if (f.agingRequisitions > 0) {
    signals.push({
      label: "Aging requisitions",
      detail: `${f.agingRequisitions} open longer than ${POLICY.agingRequisitionDays} days`,
      severity: agingRatio >= 0.5 ? "high" : "medium",
    });
  }

  if (f.avgTimeToFillDays != null && f.avgTimeToFillDays > POLICY.slowTimeToFillDays) {
    score += 15;
    signals.push({
      label: "Slow time-to-fill",
      detail: `Average ${f.avgTimeToFillDays} days to fill (target ${POLICY.slowTimeToFillDays})`,
      severity: "medium",
    });
  }

  const s = clamp(score);
  return { score: s, level: riskLevel(s), signals };
}

function computeErRisk(f: BusinessUnitFacts): RiskMetric {
  const erRate = f.headcount === 0 ? 0 : (f.openErCases / f.headcount) * 100;
  let score = erRate * 20 + f.highSeverityOpenErCases * 12;
  const signals: RiskSignal[] = [];

  signals.push({
    label: "Open ER cases",
    detail: `${f.openErCases} open case(s), ${erRate.toFixed(1)} per 100 employees`,
    severity: erRate >= 5 ? "high" : erRate >= 2 ? "medium" : "low",
  });

  if (f.highSeverityOpenErCases > 0) {
    signals.push({
      label: "High-severity cases",
      detail: `${f.highSeverityOpenErCases} open high-severity case(s) require attention`,
      severity: "high",
    });
  }

  if (f.probationFailRatePct >= 30) {
    score += 8;
    signals.push({
      label: "Probation failures",
      detail: `${f.probationFailRatePct}% of completed probations failed`,
      severity: "medium",
    });
  }

  const s = clamp(score);
  return { score: s, level: riskLevel(s), signals };
}

function computeWorkforceRisk(
  attrition: RiskMetric,
  recruitment: RiskMetric,
  er: RiskMetric,
  f: BusinessUnitFacts,
): RiskMetric {
  const compliance = clamp(
    ((POLICY.saudizationTargetPct - f.saudiPct) / POLICY.saudizationTargetPct) *
      100,
  );
  const score = clamp(
    attrition.score * 0.35 +
      recruitment.score * 0.25 +
      er.score * 0.2 +
      compliance * 0.2,
  );
  const signals: RiskSignal[] = [];
  if (compliance >= 40) {
    signals.push({
      label: "Saudization gap",
      detail: `${f.saudiPct}% vs ${POLICY.saudizationTargetPct}% target`,
      severity: compliance >= 60 ? "high" : "medium",
    });
  }
  const dominant = [
    { k: "attrition", m: attrition },
    { k: "recruitment", m: recruitment },
    { k: "employee relations", m: er },
  ].sort((a, b) => b.m.score - a.m.score)[0];
  if (dominant.m.score >= 50) {
    signals.push({
      label: "Primary driver",
      detail: `${dominant.k} risk is the largest contributor (${dominant.m.score}/100)`,
      severity: dominant.m.score >= 70 ? "high" : "medium",
    });
  }
  return { score, level: riskLevel(score), signals };
}

function computeRiskProfile(
  buId: number,
  buName: string,
  f: BusinessUnitFacts,
): RiskProfile {
  const attritionRisk = computeAttritionRisk(f);
  const recruitmentRisk = computeRecruitmentRisk(f);
  const employeeRelationsRisk = computeErRisk(f);
  const workforceRisk = computeWorkforceRisk(
    attritionRisk,
    recruitmentRisk,
    employeeRelationsRisk,
    f,
  );
  return {
    businessUnitId: buId,
    businessUnitName: buName,
    headcount: f.headcount,
    workforceRisk,
    attritionRisk,
    recruitmentRisk,
    employeeRelationsRisk,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getHealthScores(
  buIds: number[] | null,
): Promise<HealthScore[]> {
  const units = await loadBusinessUnits(buIds);
  const facts = await loadFacts(buIds);
  return units
    .map((u) => computeHealth(u.id, u.name, facts.get(u.id)!))
    .sort((a, b) => b.score - a.score);
}

export async function getRiskProfiles(
  buIds: number[] | null,
): Promise<RiskProfile[]> {
  const units = await loadBusinessUnits(buIds);
  const facts = await loadFacts(buIds);
  return units
    .map((u) => computeRiskProfile(u.id, u.name, facts.get(u.id)!))
    .sort((a, b) => b.workforceRisk.score - a.workforceRisk.score);
}

interface MetricDef {
  key: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  get: (f: BusinessUnitFacts, health: number) => number;
}

const BENCHMARK_METRICS: MetricDef[] = [
  { key: "healthScore", label: "Health Score", unit: "/100", higherIsBetter: true, get: (_f, h) => h },
  { key: "headcount", label: "Headcount", unit: "", higherIsBetter: true, get: (f) => f.headcount },
  { key: "saudizationPct", label: "Saudization", unit: "%", higherIsBetter: true, get: (f) => f.saudiPct },
  { key: "femalePct", label: "Female Ratio", unit: "%", higherIsBetter: true, get: (f) => f.femalePct },
  { key: "attritionPct", label: "Attrition", unit: "%", higherIsBetter: false, get: (f) => f.attritionPct },
  { key: "openRoles", label: "Open Roles", unit: "", higherIsBetter: false, get: (f) => f.openRoles },
];

export async function getBenchmarking(): Promise<Benchmarking> {
  const units = await loadBusinessUnits(null);
  const facts = await loadFacts(null);
  const health = new Map<number, number>();
  for (const u of units) {
    health.set(u.id, computeHealth(u.id, u.name, facts.get(u.id)!).score);
  }

  const metrics: BenchmarkMetric[] = BENCHMARK_METRICS.map((def) => {
    const raw = units.map((u) => ({
      businessUnitId: u.id,
      businessUnitName: u.name,
      value: round1(def.get(facts.get(u.id)!, health.get(u.id)!)),
    }));
    const values = raw.map((r) => r.value);
    const orgAverage =
      values.length === 0
        ? 0
        : round1(values.reduce((a, b) => a + b, 0) / values.length);
    const orgMedian = round1(median(values));

    const sorted = [...raw].sort((a, b) =>
      def.higherIsBetter ? b.value - a.value : a.value - b.value,
    );
    const n = sorted.length;
    const rows: BenchmarkRow[] = sorted.map((r, i) => ({
      ...r,
      rank: i + 1,
      percentile: n <= 1 ? 100 : Math.round(((n - 1 - i) / (n - 1)) * 100),
    }));

    return {
      key: def.key,
      label: def.label,
      unit: def.unit,
      higherIsBetter: def.higherIsBetter,
      orgAverage,
      orgMedian,
      best: rows.length > 0 ? { ...rows[0] } : null,
      worst: rows.length > 0 ? { ...rows[rows.length - 1] } : null,
      rows,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    businessUnitCount: units.length,
    metrics,
  };
}

export async function buildWorkforceContext(
  buIds: number[] | null,
  canSeeAll: boolean,
): Promise<WorkforceContext> {
  // An explicitly empty scope yields an empty context (no org-wide leakage).
  if (buIds != null && buIds.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      policy: POLICY,
      scope: { canSeeAll, businessUnitIds: [] },
      org: {
        businessUnitCount: 0,
        totalHeadcount: 0,
        kpis: {
          headcount: 0,
          saudizationPct: 0,
          femalePct: 0,
          openRoles: 0,
          attritionPct: 0,
          openErCases: 0,
        },
        trends: [],
        averageHealthScore: 0,
      },
      businessUnits: [],
    };
  }

  const units = await loadBusinessUnits(buIds);
  const facts = await loadFacts(buIds);

  const businessUnits: BusinessUnitContext[] = await Promise.all(
    units.map(async (u) => {
      const f = facts.get(u.id)!;
      const health = computeHealth(u.id, u.name, f);
      const risk = computeRiskProfile(u.id, u.name, f);
      return {
        businessUnitId: u.id,
        businessUnitName: u.name,
        kpis: await computeKpis(u.id),
        facts: f,
        healthScore: health.score,
        healthRating: health.rating,
        risk: {
          workforce: { score: risk.workforceRisk.score, level: risk.workforceRisk.level },
          attrition: { score: risk.attritionRisk.score, level: risk.attritionRisk.level },
          recruitment: { score: risk.recruitmentRisk.score, level: risk.recruitmentRisk.level },
          employeeRelations: {
            score: risk.employeeRelationsRisk.score,
            level: risk.employeeRelationsRisk.level,
          },
        },
      };
    }),
  );

  const orgBuId = buIds != null && buIds.length === 1 ? buIds[0] : null;
  const totalHeadcount = businessUnits.reduce((s, b) => s + b.kpis.headcount, 0);
  const averageHealthScore =
    businessUnits.length === 0
      ? 0
      : Math.round(
          businessUnits.reduce((s, b) => s + b.healthScore, 0) /
            businessUnits.length,
        );

  return {
    generatedAt: new Date().toISOString(),
    policy: POLICY,
    scope: { canSeeAll, businessUnitIds: units.map((u) => u.id) },
    org: {
      businessUnitCount: businessUnits.length,
      totalHeadcount,
      kpis: await computeKpis(orgBuId),
      trends: await computeTrends(orgBuId),
      averageHealthScore,
    },
    businessUnits,
  };
}

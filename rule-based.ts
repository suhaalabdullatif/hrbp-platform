import type { WorkforceContext, BusinessUnitContext } from "../engine";
import { POLICY } from "../engine";
import type {
  ExecutiveInsight,
  InsightProvider,
  InsightSeverity,
} from "./provider";

/*
  Deterministic executive-insight generator. Produces the same shape a future
  LLM provider would, but from explicit rules over the computed WorkforceContext.
  This is the "Executive Insights Framework" — narratives + recommended actions.
*/

const severityRank: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  positive: 3,
};

function pct(n: number): string {
  return `${n}%`;
}

function attritionInsight(bu: BusinessUnitContext): ExecutiveInsight | null {
  const r = bu.risk.attrition;
  if (r.level !== "high" && r.level !== "elevated") return null;
  const accelerating = bu.facts.exitsRecent3mo > bu.facts.exitsPrior3mo;
  return {
    id: `attrition-${bu.businessUnitId}`,
    category: "attrition",
    severity: r.level === "high" ? "critical" : "warning",
    title: `${bu.businessUnitName}: elevated attrition risk`,
    narrative:
      `${bu.businessUnitName} shows ${pct(bu.facts.attritionPct)} annual attrition ` +
      `with ${bu.facts.voluntarySharePct}% of exits voluntary` +
      (accelerating
        ? `, and exits accelerated this quarter (${bu.facts.exitsRecent3mo} vs ${bu.facts.exitsPrior3mo}).`
        : `.`),
    businessUnitId: bu.businessUnitId,
    businessUnitName: bu.businessUnitName,
    metrics: [
      { label: "Attrition", value: pct(bu.facts.attritionPct) },
      { label: "Voluntary share", value: pct(bu.facts.voluntarySharePct) },
      { label: "Risk score", value: `${r.score}/100` },
    ],
    recommendedActions: [
      "Run stay interviews with high-performers in the affected teams",
      "Review compensation and progression bands against market",
      "Prioritize backfill requisitions for regrettable losses",
    ],
  };
}

function recruitmentInsight(bu: BusinessUnitContext): ExecutiveInsight | null {
  const r = bu.risk.recruitment;
  if (r.level !== "high" && r.level !== "elevated") return null;
  return {
    id: `recruitment-${bu.businessUnitId}`,
    category: "recruitment",
    severity: r.level === "high" ? "critical" : "warning",
    title: `${bu.businessUnitName}: recruitment pressure`,
    narrative:
      `${bu.businessUnitName} has ${bu.facts.openRoles} open role(s), ` +
      `${bu.facts.agingRequisitions} aging beyond ${POLICY.agingRequisitionDays} days` +
      (bu.facts.avgTimeToFillDays != null
        ? `, averaging ${bu.facts.avgTimeToFillDays} days to fill.`
        : `.`),
    businessUnitId: bu.businessUnitId,
    businessUnitName: bu.businessUnitName,
    metrics: [
      { label: "Open roles", value: String(bu.facts.openRoles) },
      { label: "Aging", value: String(bu.facts.agingRequisitions) },
      { label: "Risk score", value: `${r.score}/100` },
    ],
    recommendedActions: [
      "Escalate aging requisitions to hiring managers for action",
      "Expand sourcing channels for hard-to-fill roles",
      "Review interview-loop bottlenecks to shorten time-to-fill",
    ],
  };
}

function saudizationInsight(bu: BusinessUnitContext): ExecutiveInsight | null {
  if (bu.facts.saudiPct >= POLICY.saudizationTargetPct) return null;
  const gap = Math.round(POLICY.saudizationTargetPct - bu.facts.saudiPct);
  if (gap < 10) return null;
  return {
    id: `saudization-${bu.businessUnitId}`,
    category: "saudization",
    severity: gap >= 25 ? "critical" : "warning",
    title: `${bu.businessUnitName}: Saudization below target`,
    narrative:
      `${bu.businessUnitName} is at ${pct(bu.facts.saudiPct)} Saudization, ` +
      `${gap} points below the ${POLICY.saudizationTargetPct}% target.`,
    businessUnitId: bu.businessUnitId,
    businessUnitName: bu.businessUnitName,
    metrics: [
      { label: "Saudization", value: pct(bu.facts.saudiPct) },
      { label: "Target", value: pct(POLICY.saudizationTargetPct) },
      { label: "Gap", value: `${gap} pts` },
    ],
    recommendedActions: [
      "Prioritize Saudi national candidates in open requisitions",
      "Partner with national talent pipelines and graduate programs",
      "Set BU-level Saudization milestones with monthly tracking",
    ],
  };
}

function erInsight(bu: BusinessUnitContext): ExecutiveInsight | null {
  if (bu.facts.highSeverityOpenErCases === 0) return null;
  return {
    id: `er-${bu.businessUnitId}`,
    category: "employee_relations",
    severity: "critical",
    title: `${bu.businessUnitName}: open high-severity ER cases`,
    narrative:
      `${bu.businessUnitName} has ${bu.facts.highSeverityOpenErCases} open ` +
      `high-severity employee-relations case(s) requiring leadership attention.`,
    businessUnitId: bu.businessUnitId,
    businessUnitName: bu.businessUnitName,
    metrics: [
      { label: "High severity", value: String(bu.facts.highSeverityOpenErCases) },
      { label: "Open ER cases", value: String(bu.facts.openErCases) },
    ],
    recommendedActions: [
      "Assign a senior ER partner to each high-severity case",
      "Set resolution SLAs and review case aging weekly",
      "Check for systemic patterns across affected teams",
    ],
  };
}

function topPerformerInsight(
  context: WorkforceContext,
): ExecutiveInsight | null {
  if (context.businessUnits.length < 2) return null;
  const top = [...context.businessUnits].sort(
    (a, b) => b.healthScore - a.healthScore,
  )[0];
  if (top.healthScore < 75) return null;
  return {
    id: `top-${top.businessUnitId}`,
    category: "overall",
    severity: "positive",
    title: `${top.businessUnitName}: strongest workforce health`,
    narrative:
      `${top.businessUnitName} leads with a ${top.healthScore}/100 health score ` +
      `(${top.healthRating}). Its practices are candidates to replicate across units.`,
    businessUnitId: top.businessUnitId,
    businessUnitName: top.businessUnitName,
    metrics: [
      { label: "Health score", value: `${top.healthScore}/100` },
      { label: "Attrition", value: pct(top.facts.attritionPct) },
      { label: "Saudization", value: pct(top.facts.saudiPct) },
    ],
    recommendedActions: [
      "Document retention and hiring practices from this unit",
      "Share playbooks with lower-scoring business units",
    ],
  };
}

function overviewInsight(context: WorkforceContext): ExecutiveInsight {
  const atRisk = context.businessUnits.filter(
    (b) => b.risk.workforce.level === "high" || b.risk.workforce.level === "elevated",
  );
  const severity: InsightSeverity =
    atRisk.length === 0 ? "positive" : atRisk.length >= 3 ? "critical" : "warning";
  return {
    id: "overview",
    category: "overall",
    severity,
    title: "Workforce health overview",
    narrative:
      `Average health across ${context.org.businessUnitCount} unit(s) is ` +
      `${context.org.averageHealthScore}/100 over ${context.org.totalHeadcount} employees. ` +
      (atRisk.length === 0
        ? "No business units are currently in elevated or high workforce risk."
        : `${atRisk.length} unit(s) are in elevated or high workforce risk: ${atRisk
            .map((b) => b.businessUnitName)
            .join(", ")}.`),
    businessUnitId: null,
    businessUnitName: null,
    metrics: [
      { label: "Avg health", value: `${context.org.averageHealthScore}/100` },
      { label: "Headcount", value: context.org.totalHeadcount.toLocaleString() },
      { label: "Units at risk", value: String(atRisk.length) },
    ],
    recommendedActions:
      atRisk.length === 0
        ? ["Maintain current cadence of monthly workforce reviews"]
        : [
            "Convene a workforce-risk review for the flagged units",
            "Align HRBP action plans to the dominant risk driver per unit",
          ],
  };
}

export class RuleBasedInsightProvider implements InsightProvider {
  readonly name = "rule-based";
  readonly isGenerative = false;

  async generateExecutiveInsights(
    context: WorkforceContext,
  ): Promise<ExecutiveInsight[]> {
    const insights: ExecutiveInsight[] = [overviewInsight(context)];

    for (const bu of context.businessUnits) {
      const candidates = [
        erInsight(bu),
        attritionInsight(bu),
        recruitmentInsight(bu),
        saudizationInsight(bu),
      ];
      for (const c of candidates) if (c) insights.push(c);
    }

    const top = topPerformerInsight(context);
    if (top) insights.push(top);

    return insights.sort(
      (a, b) => severityRank[a.severity] - severityRank[b.severity],
    );
  }
}

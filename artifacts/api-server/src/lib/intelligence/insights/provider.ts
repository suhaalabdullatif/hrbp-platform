import type { WorkforceContext } from "../engine";

/*
  Pluggable insight-provider seam.

  Today only a deterministic, rule-based provider exists. The interface is the
  contract a future LLM-backed provider (OpenAI, Azure OpenAI, Anthropic, ...)
  implements WITHOUT requiring changes to routes or the frontend: it receives the
  same WorkforceContext (the full set of computed data points) and returns the
  same insight shapes.

  When wiring an LLM provider later:
    1. Add a new file (e.g. openai.ts) exporting a class implementing InsightProvider.
    2. Register it in ./index.ts behind the INSIGHT_PROVIDER env switch.
    3. No route, schema, or UI change is needed.
*/

export type InsightCategory =
  | "overall"
  | "attrition"
  | "recruitment"
  | "saudization"
  | "diversity"
  | "employee_relations";

export type InsightSeverity = "positive" | "info" | "warning" | "critical";

export interface InsightMetric {
  label: string;
  value: string;
}

export interface ExecutiveInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  narrative: string;
  businessUnitId: number | null;
  businessUnitName: string | null;
  metrics: InsightMetric[];
  recommendedActions: string[];
}

export interface InsightProvider {
  /** Stable identifier, e.g. "rule-based" or "openai". */
  readonly name: string;
  /** True when the provider is backed by a generative model. */
  readonly isGenerative: boolean;
  generateExecutiveInsights(
    context: WorkforceContext,
  ): Promise<ExecutiveInsight[]>;
}

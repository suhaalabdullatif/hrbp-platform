import type { InsightProvider } from "./provider";
import { RuleBasedInsightProvider } from "./rule-based";

export type { InsightProvider, ExecutiveInsight } from "./provider";

let cached: InsightProvider | null = null;

/*
  Factory selecting the active insight provider. Default is deterministic
  rule-based generation. To enable an LLM-backed provider later, set
  INSIGHT_PROVIDER (e.g. "openai" | "azure-openai") and add the corresponding
  case below — no route or UI changes required.
*/
export function getInsightProvider(): InsightProvider {
  if (cached) return cached;

  const kind = (process.env.INSIGHT_PROVIDER ?? "rule-based").toLowerCase();
  switch (kind) {
    case "rule-based":
      cached = new RuleBasedInsightProvider();
      break;
    // case "openai":
    //   cached = new OpenAIInsightProvider();
    //   break;
    // case "azure-openai":
    //   cached = new AzureOpenAIInsightProvider();
    //   break;
    default:
      // Unknown configuration falls back to the safe deterministic provider.
      cached = new RuleBasedInsightProvider();
      break;
  }
  return cached;
}

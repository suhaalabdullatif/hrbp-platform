import {
  useGetIntelligenceInsights,
  type ExecutiveInsight,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Info, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

function severityMeta(severity: string): {
  icon: typeof Info;
  badge: string;
  accent: string;
} {
  switch (severity) {
    case "critical":
      return {
        icon: AlertOctagon,
        badge: "bg-destructive/10 text-destructive",
        accent: "border-l-destructive",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        badge: "bg-amber-500/15 text-amber-600 dark:text-amber-500",
        accent: "border-l-amber-500",
      };
    case "positive":
      return {
        icon: CheckCircle2,
        badge: "bg-primary/10 text-primary",
        accent: "border-l-primary",
      };
    default:
      return {
        icon: Info,
        badge: "bg-muted text-muted-foreground",
        accent: "border-l-muted-foreground",
      };
  }
}

function InsightCard({ i }: { i: ExecutiveInsight }) {
  const meta = severityMeta(i.severity);
  const Icon = meta.icon;
  return (
    <Card className={cn("border-l-4", meta.accent)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 shrink-0" />
            {i.title}
          </CardTitle>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
              meta.badge,
            )}
          >
            {i.severity}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{i.narrative}</p>

        {i.metrics.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {i.metrics.map((m, idx) => (
              <div key={idx}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
                <div className="font-display text-lg text-foreground">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {i.recommendedActions.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recommended actions
            </div>
            <ul className="space-y-1">
              {i.recommendedActions.map((a, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IntelligenceInsights() {
  const { data, isLoading } = useGetIntelligenceInsights();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const insights = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-foreground">Executive Insights</h2>
        <p className="text-muted-foreground">
          Rule-based findings and recommended actions across your workforce
        </p>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No insights available
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map((i) => (
            <InsightCard key={i.id} i={i} />
          ))}
        </div>
      )}
    </div>
  );
}

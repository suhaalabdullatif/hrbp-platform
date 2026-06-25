import {
  useGetIntelligenceRisk,
  type RiskMetric,
  type RiskProfile,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserMinus, Briefcase, AlertTriangle, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

function levelClass(level: string): string {
  switch (level) {
    case "low":
      return "bg-primary/10 text-primary";
    case "moderate":
      return "bg-muted text-muted-foreground";
    case "elevated":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-500";
    default:
      return "bg-destructive/10 text-destructive";
  }
}

function signalDotClass(severity: string): string {
  switch (severity) {
    case "high":
      return "bg-destructive";
    case "medium":
      return "bg-amber-500";
    default:
      return "bg-primary";
  }
}

function MetricBlock({
  label,
  icon: Icon,
  metric,
}: {
  label: string;
  icon: typeof Gauge;
  metric: RiskMetric;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-foreground">
            {metric.score}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
              levelClass(metric.level),
            )}
          >
            {metric.level}
          </span>
        </div>
      </div>
      {metric.signals.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {metric.signals.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span
                className={cn(
                  "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                  signalDotClass(s.severity),
                )}
              />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{s.label}:</span>{" "}
                {s.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProfileCard({ r }: { r: RiskProfile }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{r.businessUnitName}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Workforce risk</span>
            <span className="font-display text-2xl text-foreground">
              {r.workforceRisk.score}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                levelClass(r.workforceRisk.level),
              )}
            >
              {r.workforceRisk.level}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <MetricBlock label="Attrition" icon={UserMinus} metric={r.attritionRisk} />
        <MetricBlock
          label="Recruitment"
          icon={Briefcase}
          metric={r.recruitmentRisk}
        />
        <MetricBlock
          label="Employee Relations"
          icon={AlertTriangle}
          metric={r.employeeRelationsRisk}
        />
      </CardContent>
    </Card>
  );
}

export default function IntelligenceRisk() {
  const { data, isLoading } = useGetIntelligenceRisk();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profiles = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-foreground">Workforce Risk</h2>
        <p className="text-muted-foreground">
          Attrition, recruitment, and employee-relations risk with drivers
        </p>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No risk data available
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {profiles.map((r) => (
            <ProfileCard key={r.businessUnitId} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

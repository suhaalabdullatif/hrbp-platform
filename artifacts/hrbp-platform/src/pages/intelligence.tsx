import { Link } from "wouter";
import {
  useGetIntelligenceHealthScores,
  useGetIntelligenceRisk,
  useGetIntelligenceInsights,
  useGetCurrentUser,
  UserRole,
  type HealthScore,
  type RiskProfile,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Activity, ShieldAlert, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

function ratingClass(rating: string): string {
  switch (rating) {
    case "Excellent":
      return "text-primary";
    case "Good":
      return "text-foreground";
    case "Fair":
      return "text-amber-600 dark:text-amber-500";
    default:
      return "text-destructive";
  }
}

function riskLevelClass(level: string): string {
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

function HealthCard({ h }: { h: HealthScore }) {
  return (
    <Card className="relative overflow-hidden">
      <span className="absolute inset-x-0 top-0 h-1 bg-rise" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          {h.businessUnitName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{h.headcount} employees</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="font-display text-4xl text-foreground">{h.score}</div>
          <span className={cn("text-sm font-semibold", ratingClass(h.rating))}>
            {h.rating}
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {h.subScores.map((s) => (
            <div key={s.key} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.label}</span>
                <span>{s.score}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RiskRow({ r }: { r: RiskProfile }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {r.businessUnitName}
        </p>
        <p className="text-xs text-muted-foreground">
          {r.workforceRisk.signals[0]?.detail ?? "No active risk drivers"}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-display text-2xl text-foreground">
          {r.workforceRisk.score}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
            riskLevelClass(r.workforceRisk.level),
          )}
        >
          {r.workforceRisk.level}
        </span>
      </div>
    </div>
  );
}

export default function Intelligence() {
  const { data: health, isLoading: loadingHealth } =
    useGetIntelligenceHealthScores();
  const { data: risk, isLoading: loadingRisk } = useGetIntelligenceRisk();
  const { data: insights, isLoading: loadingInsights } =
    useGetIntelligenceInsights();
  const { data: user } = useGetCurrentUser();

  const canBenchmark =
    user?.role === UserRole.CHRO ||
    user?.role === UserRole.HR_DIRECTOR ||
    user?.role === UserRole.ADMIN;

  if (loadingHealth || loadingRisk || loadingInsights) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const healthScores = health ?? [];
  const riskProfiles = (risk ?? []).slice(0, 6);
  const topInsights = (insights ?? []).slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-foreground">Workforce Intelligence</h2>
        <p className="text-muted-foreground">
          Deterministic health scoring, risk detection, and executive insights
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/intelligence/risk">
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            <ShieldAlert className="h-4 w-4" /> Risk detail
          </span>
        </Link>
        {canBenchmark && (
          <Link href="/intelligence/benchmarking">
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
              <Activity className="h-4 w-4" /> Benchmarking
            </span>
          </Link>
        )}
        <Link href="/intelligence/insights">
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            <Lightbulb className="h-4 w-4" /> Insights
          </span>
        </Link>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Business Unit Health
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {healthScores.map((h) => (
            <HealthCard key={h.businessUnitId} h={h} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-5 w-5" /> Top Workforce Risk
            </CardTitle>
            <Link href="/intelligence/risk">
              <span className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskProfiles.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No risk data available
              </p>
            ) : (
              riskProfiles.map((r) => (
                <RiskRow key={r.businessUnitId} r={r} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5" /> Executive Insights
            </CardTitle>
            <Link href="/intelligence/insights">
              <span className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topInsights.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No insights available
              </p>
            ) : (
              topInsights.map((i) => (
                <div key={i.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium text-foreground">
                    {i.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {i.narrative}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

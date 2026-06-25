import { useState } from "react";
import {
  useGetIntelligenceBenchmarking,
  type BenchmarkMetric,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(value: number, unit: string): string {
  if (unit === "%") return `${value}%`;
  if (unit === "/100") return `${value}/100`;
  return value.toLocaleString();
}

export default function IntelligenceBenchmarking() {
  const { data, isLoading, isError } = useGetIntelligenceBenchmarking();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl text-foreground">Cross-BU Benchmarking</h2>
          <p className="text-muted-foreground">
            Organization-wide benchmarking
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Cross-BU benchmarking is available to organization-wide roles only.
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics: BenchmarkMetric[] = data?.metrics ?? [];
  const active = metrics.find((m) => m.key === activeKey) ?? metrics[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-foreground">Cross-BU Benchmarking</h2>
        <p className="text-muted-foreground">
          Compare every business unit against the organization across {metrics.length} metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card
            key={m.key}
            className={cn(
              "cursor-pointer transition-colors",
              active?.key === m.key && "border-primary",
            )}
            onClick={() => setActiveKey(m.key)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="font-display text-2xl text-foreground">
                {fmt(m.orgAverage, m.unit)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  org avg
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Best: {m.best ? `${m.best.businessUnitName} (${fmt(m.best.value, m.unit)})` : "—"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Worst: {m.worst ? `${m.worst.businessUnitName} (${fmt(m.worst.value, m.unit)})` : "—"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {active && (
        <Card>
          <CardHeader>
            <CardTitle>
              {active.label} — ranked ({active.higherIsBetter ? "higher is better" : "lower is better"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead className="text-right">{active.label}</TableHead>
                    <TableHead className="text-right">Percentile</TableHead>
                    <TableHead className="text-right">vs Org Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.rows.map((row) => {
                    const delta = Math.round((row.value - active.orgAverage) * 10) / 10;
                    return (
                      <TableRow key={row.businessUnitId}>
                        <TableCell className="font-medium">{row.rank}</TableCell>
                        <TableCell>{row.businessUnitName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt(row.value, active.unit)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {row.percentile}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

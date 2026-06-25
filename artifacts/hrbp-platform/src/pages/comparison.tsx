import { useGetDashboardComparison } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Comparison() {
  const { data, isLoading } = useGetDashboardComparison();

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const comparisonData = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Business Unit Comparison</h2>
        <p className="text-muted-foreground">Compare metrics across all business units</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Headcount by Business Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="businessUnitName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="headcount" name="Headcount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saudization vs Female %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="businessUnitName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="saudizationPct" name="Saudization %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="femalePct" name="Female %" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Unit</TableHead>
                  <TableHead className="text-right">Headcount</TableHead>
                  <TableHead className="text-right">Saudization %</TableHead>
                  <TableHead className="text-right">Female %</TableHead>
                  <TableHead className="text-right">Open Roles</TableHead>
                  <TableHead className="text-right">Attrition %</TableHead>
                  <TableHead className="text-right">Open ER Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  comparisonData.map((row) => (
                    <TableRow key={row.businessUnitId}>
                      <TableCell className="font-medium">{row.businessUnitName}</TableCell>
                      <TableCell className="text-right">{row.headcount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.saudizationPct.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{row.femalePct.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{row.openRoles}</TableCell>
                      <TableCell className="text-right">{row.attritionPct.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{row.openErCases}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

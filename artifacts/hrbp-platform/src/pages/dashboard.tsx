import { useGetDashboardKpis, useGetDashboardTrends, useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Target, UserCheck, Briefcase, AlertTriangle, UserMinus, Bell } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: kpis, isLoading: isLoadingKpis } = useGetDashboardKpis();
  const { data: trends, isLoading: isLoadingTrends } = useGetDashboardTrends();
  const { data: notifications, isLoading: isLoadingNotifications } = useListNotifications();

  if (isLoadingKpis || isLoadingTrends || isLoadingNotifications) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Headcount", value: kpis?.headcount || 0, icon: Users, format: (v: number) => v.toLocaleString() },
    { title: "Saudization", value: kpis?.saudizationPct || 0, icon: Target, format: (v: number) => `${v.toFixed(1)}%` },
    { title: "Female Ratio", value: kpis?.femalePct || 0, icon: UserCheck, format: (v: number) => `${v.toFixed(1)}%` },
    { title: "Open Roles", value: kpis?.openRoles || 0, icon: Briefcase, format: (v: number) => v.toString() },
    { title: "Attrition Rate", value: kpis?.attritionPct || 0, icon: UserMinus, format: (v: number) => `${v.toFixed(1)}%` },
    { title: "Open ER Cases", value: kpis?.openErCases || 0, icon: AlertTriangle, format: (v: number) => v.toString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your workforce metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="relative overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1 bg-rise" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <kpi.icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="font-display text-4xl text-foreground">{kpi.format(kpi.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Headcount Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return isNaN(d.getTime()) ? value : format(d, "MMM yyyy");
                    }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelFormatter={(value) => {
                      const d = new Date(value);
                      return isNaN(d.getTime()) ? value : format(d, "MMMM yyyy");
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="headcount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHeadcount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent alerts
                </div>
              ) : (
                notifications?.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 rounded-md border p-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

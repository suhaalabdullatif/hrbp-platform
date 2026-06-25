import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Comparison from "@/pages/comparison";
import EmployeesList from "@/pages/employees";
import EmployeeDetail from "@/pages/employee-detail";
import RequisitionsList from "@/pages/requisitions";
import RequisitionDetail from "@/pages/requisition-detail";
import ErCasesList from "@/pages/er-cases";
import ErCaseDetail from "@/pages/er-case-detail";
import AttritionList from "@/pages/attrition";
import AttritionDetail from "@/pages/attrition-detail";
import ProbationList from "@/pages/probation";
import ProbationDetail from "@/pages/probation-detail";
import UsersList from "@/pages/users";
import UserDetail from "@/pages/user-detail";
import AuditLog from "@/pages/audit";
import Intelligence from "@/pages/intelligence";
import IntelligenceRisk from "@/pages/intelligence-risk";
import IntelligenceBenchmarking from "@/pages/intelligence-benchmarking";
import IntelligenceInsights from "@/pages/intelligence-insights";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRouter() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/comparison" component={Comparison} />
        <Route path="/intelligence" component={Intelligence} />
        <Route path="/intelligence/risk" component={IntelligenceRisk} />
        <Route path="/intelligence/benchmarking" component={IntelligenceBenchmarking} />
        <Route path="/intelligence/insights" component={IntelligenceInsights} />
        <Route path="/employees" component={EmployeesList} />
        <Route path="/employees/new" component={EmployeeDetail} />
        <Route path="/employees/:id" component={EmployeeDetail} />
        <Route path="/requisitions" component={RequisitionsList} />
        <Route path="/requisitions/new" component={RequisitionDetail} />
        <Route path="/requisitions/:id" component={RequisitionDetail} />
        <Route path="/er-cases" component={ErCasesList} />
        <Route path="/er-cases/new" component={ErCaseDetail} />
        <Route path="/er-cases/:id" component={ErCaseDetail} />
        <Route path="/attrition" component={AttritionList} />
        <Route path="/attrition/new" component={AttritionDetail} />
        <Route path="/probation" component={ProbationList} />
        <Route path="/probation/new" component={ProbationDetail} />
        <Route path="/probation/:id" component={ProbationDetail} />
        <Route path="/admin/users" component={UsersList} />
        <Route path="/admin/users/new" component={UserDetail} />
        <Route path="/admin/users/:id" component={UserDetail} />
        <Route path="/audit" component={AuditLog} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <AuthGuard>
          <ProtectedRouter />
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

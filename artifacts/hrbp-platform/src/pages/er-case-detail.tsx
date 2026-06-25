import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetErCase, 
  useCreateErCase, 
  useUpdateErCase, 
  useListBusinessUnits,
  getGetErCaseQueryKey,
  getListErCasesQueryKey,
  ErCaseInputSeverity,
  ErCaseInputStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  caseNumber: z.string().min(1, "Required"),
  employeeId: z.coerce.number().optional().nullable(),
  businessUnitId: z.coerce.number().min(1, "Required"),
  caseType: z.string().min(1, "Required"),
  severity: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "in_progress", "closed"]),
  openedDate: z.string().min(1, "Required"),
  closedDate: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
});

export default function ErCaseDetail() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const erCaseId = isNew ? 0 : parseInt(params.id!);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessUnits } = useListBusinessUnits();
  const { data: erCase, isLoading: isLoadingErCase } = useGetErCase(erCaseId, {
    query: { enabled: !isNew && !!erCaseId, queryKey: getGetErCaseQueryKey(erCaseId) }
  });

  const createErCase = useCreateErCase();
  const updateErCase = useUpdateErCase();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseNumber: "",
      employeeId: null as number | null,
      businessUnitId: 0,
      caseType: "",
      severity: "low" as ErCaseInputSeverity,
      status: "open" as ErCaseInputStatus,
      openedDate: new Date().toISOString().split("T")[0],
      closedDate: "",
      summary: "",
    }
  });

  useEffect(() => {
    if (erCase && !isNew) {
      reset({
        caseNumber: erCase.caseNumber,
        employeeId: erCase.employeeId,
        businessUnitId: erCase.businessUnitId,
        caseType: erCase.caseType,
        severity: erCase.severity as any,
        status: erCase.status as any,
        openedDate: erCase.openedDate.split("T")[0],
        closedDate: erCase.closedDate ? erCase.closedDate.split("T")[0] : "",
        summary: erCase.summary || "",
      });
    }
  }, [erCase, isNew, reset]);

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (!payload.employeeId) payload.employeeId = null;
    if (!payload.closedDate) payload.closedDate = null;
    if (!payload.summary) payload.summary = null;

    if (isNew) {
      createErCase.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "ER Case created" });
            queryClient.invalidateQueries({ queryKey: getListErCasesQueryKey() });
            setLocation("/er-cases");
          },
          onError: () => toast({ title: "Failed to create case", variant: "destructive" })
        }
      );
    } else {
      updateErCase.mutate(
        { id: erCaseId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "ER Case updated" });
            queryClient.invalidateQueries({ queryKey: getGetErCaseQueryKey(erCaseId) });
            queryClient.invalidateQueries({ queryKey: getListErCasesQueryKey() });
            setLocation("/er-cases");
          },
          onError: () => toast({ title: "Failed to update case", variant: "destructive" })
        }
      );
    }
  };

  if (!isNew && isLoadingErCase) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/er-cases">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isNew ? "Log ER Case" : "Edit ER Case"}
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Case Number</Label>
                <Controller
                  name="caseNumber"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.caseNumber && <span className="text-xs text-destructive">{errors.caseNumber.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Employee ID (Optional)</Label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Business Unit</Label>
                <Controller
                  name="businessUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ? field.value.toString() : ""} onValueChange={(val) => field.onChange(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BU" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessUnits?.map((bu) => (
                          <SelectItem key={bu.id} value={bu.id.toString()}>{bu.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.businessUnitId && <span className="text-xs text-destructive">{errors.businessUnitId.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Case Type</Label>
                <Controller
                  name="caseType"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.caseType && <span className="text-xs text-destructive">{errors.caseType.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Opened Date</Label>
                <Controller
                  name="openedDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </div>
              <div className="space-y-2">
                <Label>Closed Date</Label>
                <Controller
                  name="closedDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" value={field.value || ""} />}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Summary</Label>
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => <Input {...field} value={field.value || ""} />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/er-cases")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? "Log Case" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

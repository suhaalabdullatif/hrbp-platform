import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetProbation, 
  useCreateProbation, 
  useUpdateProbation, 
  useListBusinessUnits,
  getGetProbationQueryKey,
  getListProbationQueryKey,
  ProbationInputStatus
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
  employeeId: z.coerce.number().min(1, "Required"),
  businessUnitId: z.coerce.number().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  status: z.enum(["pending", "passed", "failed", "extended"]),
  reviewDate: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
});

export default function ProbationDetail() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const probationId = isNew ? 0 : parseInt(params.id!);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessUnits } = useListBusinessUnits();
  const { data: probation, isLoading: isLoadingProbation } = useGetProbation(probationId, {
    query: { enabled: !isNew && !!probationId, queryKey: getGetProbationQueryKey(probationId) }
  });

  const createProbation = useCreateProbation();
  const updateProbation = useUpdateProbation();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: 0,
      businessUnitId: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "pending" as ProbationInputStatus,
      reviewDate: "",
      outcome: "",
    }
  });

  useEffect(() => {
    if (probation && !isNew) {
      reset({
        employeeId: probation.employeeId,
        businessUnitId: probation.businessUnitId,
        startDate: probation.startDate.split("T")[0],
        endDate: probation.endDate.split("T")[0],
        status: probation.status as any,
        reviewDate: probation.reviewDate ? probation.reviewDate.split("T")[0] : "",
        outcome: probation.outcome || "",
      });
    }
  }, [probation, isNew, reset]);

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (!payload.reviewDate) payload.reviewDate = null;
    if (!payload.outcome) payload.outcome = null;

    if (isNew) {
      createProbation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Probation created" });
            queryClient.invalidateQueries({ queryKey: getListProbationQueryKey() });
            setLocation("/probation");
          },
          onError: () => toast({ title: "Failed to create probation", variant: "destructive" })
        }
      );
    } else {
      updateProbation.mutate(
        { id: probationId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Probation updated" });
            queryClient.invalidateQueries({ queryKey: getGetProbationQueryKey(probationId) });
            queryClient.invalidateQueries({ queryKey: getListProbationQueryKey() });
            setLocation("/probation");
          },
          onError: () => toast({ title: "Failed to update probation", variant: "destructive" })
        }
      );
    }
  };

  if (!isNew && isLoadingProbation) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/probation">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isNew ? "Add Probation Record" : "Edit Probation Record"}
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(parseInt(e.target.value))} />}
                />
                {errors.employeeId && <span className="text-xs text-destructive">{errors.employeeId.message as string}</span>}
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
                <Label>Start Date</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="extended">Extended</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Review Date</Label>
                <Controller
                  name="reviewDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" value={field.value || ""} />}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Outcome</Label>
                <Controller
                  name="outcome"
                  control={control}
                  render={({ field }) => <Input {...field} value={field.value || ""} />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/probation")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? "Create Record" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

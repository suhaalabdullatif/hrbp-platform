import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetRequisition, 
  useCreateRequisition, 
  useUpdateRequisition, 
  useListBusinessUnits,
  getGetRequisitionQueryKey,
  getListRequisitionsQueryKey,
  RequisitionInputStatus
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
  title: z.string().min(1, "Required"),
  businessUnitId: z.coerce.number().min(1, "Required"),
  status: z.enum(["open", "on_hold", "filled", "cancelled"]),
  grade: z.string().min(1, "Required"),
  openedDate: z.string().min(1, "Required"),
  targetCloseDate: z.string().optional().nullable(),
  filledDate: z.string().optional().nullable(),
  recruiter: z.string().min(1, "Required"),
});

export default function RequisitionDetail() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const requisitionId = isNew ? 0 : parseInt(params.id!);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessUnits } = useListBusinessUnits();
  const { data: requisition, isLoading: isLoadingRequisition } = useGetRequisition(requisitionId, {
    query: { enabled: !isNew && !!requisitionId, queryKey: getGetRequisitionQueryKey(requisitionId) }
  });

  const createRequisition = useCreateRequisition();
  const updateRequisition = useUpdateRequisition();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      businessUnitId: 0,
      status: "open" as RequisitionInputStatus,
      grade: "",
      openedDate: new Date().toISOString().split("T")[0],
      targetCloseDate: "",
      filledDate: "",
      recruiter: "",
    }
  });

  useEffect(() => {
    if (requisition && !isNew) {
      reset({
        title: requisition.title,
        businessUnitId: requisition.businessUnitId,
        status: requisition.status as any,
        grade: requisition.grade,
        openedDate: requisition.openedDate.split("T")[0],
        targetCloseDate: requisition.targetCloseDate ? requisition.targetCloseDate.split("T")[0] : "",
        filledDate: requisition.filledDate ? requisition.filledDate.split("T")[0] : "",
        recruiter: requisition.recruiter,
      });
    }
  }, [requisition, isNew, reset]);

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (!payload.targetCloseDate) payload.targetCloseDate = null;
    if (!payload.filledDate) payload.filledDate = null;

    if (isNew) {
      createRequisition.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Requisition created" });
            queryClient.invalidateQueries({ queryKey: getListRequisitionsQueryKey() });
            setLocation("/requisitions");
          },
          onError: () => toast({ title: "Failed to create requisition", variant: "destructive" })
        }
      );
    } else {
      updateRequisition.mutate(
        { id: requisitionId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Requisition updated" });
            queryClient.invalidateQueries({ queryKey: getGetRequisitionQueryKey(requisitionId) });
            queryClient.invalidateQueries({ queryKey: getListRequisitionsQueryKey() });
            setLocation("/requisitions");
          },
          onError: () => toast({ title: "Failed to update requisition", variant: "destructive" })
        }
      );
    }
  };

  if (!isNew && isLoadingRequisition) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/requisitions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isNew ? "Add Requisition" : "Edit Requisition"}
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Title</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.title && <span className="text-xs text-destructive">{errors.title.message as string}</span>}
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
                <Label>Grade</Label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.grade && <span className="text-xs text-destructive">{errors.grade.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Recruiter</Label>
                <Controller
                  name="recruiter"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.recruiter && <span className="text-xs text-destructive">{errors.recruiter.message as string}</span>}
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
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <Label>Target Close Date</Label>
                <Controller
                  name="targetCloseDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" value={field.value || ""} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Filled Date</Label>
                <Controller
                  name="filledDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" value={field.value || ""} />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/requisitions")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? "Create Requisition" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

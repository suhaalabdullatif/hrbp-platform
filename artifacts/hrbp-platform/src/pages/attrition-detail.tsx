import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useCreateAttrition, 
  useListBusinessUnits,
  getListAttritionQueryKey,
  AttritionInputAttritionType
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
  attritionType: z.enum(["voluntary", "involuntary"]),
  reason: z.string().optional().nullable(),
  exitDate: z.string().min(1, "Required"),
});

export default function AttritionDetail() {
  const [_, setLocation] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessUnits } = useListBusinessUnits();
  const createAttrition = useCreateAttrition();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: 0,
      businessUnitId: 0,
      attritionType: "voluntary" as AttritionInputAttritionType,
      reason: "",
      exitDate: new Date().toISOString().split("T")[0],
    }
  });

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (!payload.reason) payload.reason = null;

    createAttrition.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast({ title: "Attrition record created" });
          queryClient.invalidateQueries({ queryKey: getListAttritionQueryKey() });
          setLocation("/attrition");
        },
        onError: () => toast({ title: "Failed to log attrition", variant: "destructive" })
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/attrition">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Log Exit
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
                <Label>Type</Label>
                <Controller
                  name="attritionType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voluntary">Voluntary</SelectItem>
                        <SelectItem value="involuntary">Involuntary</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Exit Date</Label>
                <Controller
                  name="exitDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Reason (Optional)</Label>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => <Input {...field} value={field.value || ""} />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/attrition")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Exit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

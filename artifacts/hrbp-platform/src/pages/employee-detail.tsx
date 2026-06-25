import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetEmployee, 
  useCreateEmployee, 
  useUpdateEmployee, 
  useListBusinessUnits,
  getGetEmployeeQueryKey,
  getListEmployeesQueryKey,
  EmployeeInputGender,
  EmployeeInputEmploymentStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  employeeNumber: z.string().min(1, "Required"),
  fullName: z.string().min(1, "Required"),
  email: z.string().email(),
  gender: z.enum(["M", "F"]),
  isSaudi: z.boolean(),
  businessUnitId: z.coerce.number().min(1, "Required"),
  jobTitle: z.string().min(1, "Required"),
  grade: z.string().min(1, "Required"),
  employmentStatus: z.enum(["active", "on_probation", "terminated"]),
  hireDate: z.string().min(1, "Required"),
});

export default function EmployeeDetail() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const employeeId = isNew ? 0 : parseInt(params.id!);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessUnits } = useListBusinessUnits();
  const { data: employee, isLoading: isLoadingEmployee } = useGetEmployee(employeeId, {
    query: { enabled: !isNew && !!employeeId, queryKey: getGetEmployeeQueryKey(employeeId) }
  });

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeNumber: "",
      fullName: "",
      email: "",
      gender: "M" as EmployeeInputGender,
      isSaudi: true,
      businessUnitId: 0,
      jobTitle: "",
      grade: "",
      employmentStatus: "active" as EmployeeInputEmploymentStatus,
      hireDate: new Date().toISOString().split("T")[0],
    }
  });

  useEffect(() => {
    if (employee && !isNew) {
      reset({
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
        email: employee.email,
        gender: employee.gender as any,
        isSaudi: employee.isSaudi,
        businessUnitId: employee.businessUnitId,
        jobTitle: employee.jobTitle,
        grade: employee.grade,
        employmentStatus: employee.employmentStatus as any,
        hireDate: employee.hireDate.split("T")[0],
      });
    }
  }, [employee, isNew, reset]);

  const onSubmit = (data: any) => {
    if (isNew) {
      createEmployee.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Employee created" });
            queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
            setLocation("/employees");
          },
          onError: () => toast({ title: "Failed to create employee", variant: "destructive" })
        }
      );
    } else {
      updateEmployee.mutate(
        { id: employeeId, data },
        {
          onSuccess: () => {
            toast({ title: "Employee updated" });
            queryClient.invalidateQueries({ queryKey: getGetEmployeeQueryKey(employeeId) });
            queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
            setLocation("/employees");
          },
          onError: () => toast({ title: "Failed to update employee", variant: "destructive" })
        }
      );
    }
  };

  if (!isNew && isLoadingEmployee) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isNew ? "Add Employee" : "Edit Employee"}
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee Number</Label>
                <Controller
                  name="employeeNumber"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="EMP001" />}
                />
                {errors.employeeNumber && <span className="text-xs text-destructive">{errors.employeeNumber.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="John Doe" />}
                />
                {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input {...field} type="email" placeholder="john@example.com" />}
                />
                {errors.email && <span className="text-xs text-destructive">{errors.email.message as string}</span>}
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
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Controller
                  name="jobTitle"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="employmentStatus"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_probation">On Probation</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Controller
                  name="hireDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <Label className="mb-2">Saudi National</Label>
                <Controller
                  name="isSaudi"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/employees")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? "Create Employee" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

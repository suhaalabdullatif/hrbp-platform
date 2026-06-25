import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetUser, 
  useCreateUser, 
  useUpdateUser, 
  useListBusinessUnits,
  getGetUserQueryKey,
  getListUsersQueryKey,
  UserInputRole
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
  email: z.string().email("Invalid email").min(1, "Required"),
  displayName: z.string().min(1, "Required"),
  role: z.enum(["HRBP", "HR_DIRECTOR", "CHRO", "ADMIN"]),
  businessUnitId: z.coerce.number().optional().nullable(),
  isActive: z.boolean().optional(),
});

export default function UserDetail() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const userId = isNew ? 0 : parseInt(params.id!);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessUnits } = useListBusinessUnits();
  const { data: user, isLoading: isLoadingUser } = useGetUser(userId, {
    query: { enabled: !isNew && !!userId, queryKey: getGetUserQueryKey(userId) }
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      role: "HRBP" as UserInputRole,
      businessUnitId: null as number | null,
      isActive: true,
    }
  });

  useEffect(() => {
    if (user && !isNew) {
      reset({
        email: user.email,
        displayName: user.displayName,
        role: user.role as any,
        businessUnitId: user.businessUnitId,
        isActive: user.isActive,
      });
    }
  }, [user, isNew, reset]);

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (!payload.businessUnitId) payload.businessUnitId = null;

    if (isNew) {
      createUser.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "User created" });
            queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
            setLocation("/admin/users");
          },
          onError: () => toast({ title: "Failed to create user", variant: "destructive" })
        }
      );
    } else {
      updateUser.mutate(
        { id: userId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "User updated" });
            queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) });
            queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
            setLocation("/admin/users");
          },
          onError: () => toast({ title: "Failed to update user", variant: "destructive" })
        }
      );
    }
  };

  if (!isNew && isLoadingUser) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isNew ? "Add User" : "Edit User"}
          </h2>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input {...field} type="email" />}
                />
                {errors.email && <span className="text-xs text-destructive">{errors.email.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Controller
                  name="displayName"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
                {errors.displayName && <span className="text-xs text-destructive">{errors.displayName.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HRBP">HRBP</SelectItem>
                        <SelectItem value="HR_DIRECTOR">HR Director</SelectItem>
                        <SelectItem value="CHRO">CHRO</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Business Unit (Optional)</Label>
                <Controller
                  name="businessUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ? field.value.toString() : "none"} onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Global" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Global (All BUs)</SelectItem>
                        {businessUnits?.map((bu) => (
                          <SelectItem key={bu.id} value={bu.id.toString()}>{bu.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <Label className="mb-2">Is Active</Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setLocation("/admin/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? "Create User" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

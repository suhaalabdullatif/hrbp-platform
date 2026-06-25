import { useState } from "react";
import { useListRequisitions, useDeleteRequisition, getListRequisitionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Plus, Search, Trash2, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function RequisitionsList() {
  const { data: requisitions, isLoading } = useListRequisitions({});
  const deleteRequisition = useDeleteRequisition();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this requisition?")) {
      deleteRequisition.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Requisition deleted" });
            queryClient.invalidateQueries({ queryKey: getListRequisitionsQueryKey() });
          },
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default" className="bg-green-600">Open</Badge>;
      case "on_hold":
        return <Badge variant="secondary">On Hold</Badge>;
      case "filled":
        return <Badge variant="default" className="bg-primary">Filled</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Requisitions</h2>
          <p className="text-muted-foreground">Manage open roles and hiring</p>
        </div>
        <Link href="/requisitions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Requisition
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requisitions..."
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opened Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!requisitions || requisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No requisitions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requisitions.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.title}</TableCell>
                        <TableCell>{req.businessUnitName}</TableCell>
                        <TableCell>{req.grade}</TableCell>
                        <TableCell>{req.recruiter}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{format(new Date(req.openedDate), "PP")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/requisitions/${req.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

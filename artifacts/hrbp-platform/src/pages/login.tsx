import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useListPersonas, useLogin, useGetCurrentUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUser();
  const { data: personas, isLoading: isLoadingPersonas } = useListPersonas();
  const loginMutation = useLogin();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isLoadingUser) {
      setLocation("/");
    }
  }, [user, isLoadingUser, setLocation]);

  const handleLogin = (personaKey: string) => {
    loginMutation.mutate({ data: { persona: personaKey } }, {
      onSuccess: () => {
        toast({ title: "Logged in successfully" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Login failed", variant: "destructive" });
      }
    });
  };

  if (isLoadingUser || isLoadingPersonas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Workforce Intelligence</h1>
          <p className="text-muted-foreground">Select a persona to continue</p>
        </div>
        
        <div className="grid gap-4">
          {personas?.map((persona) => (
            <Card key={persona.key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleLogin(persona.key)}>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{persona.label}</CardTitle>
                <CardDescription>
                  <span className="font-medium text-foreground">{persona.role}</span>
                  {persona.businessUnitName && ` • ${persona.businessUnitName}`}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

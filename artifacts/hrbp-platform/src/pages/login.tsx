import { Loader2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useListPersonas, useLogin, useGetCurrentUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Wordmark } from "@/components/brand/wordmark";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[hsl(0_0%_7%)] p-12 text-white">
        <div className="absolute inset-0 bg-rise opacity-90" />
        <div className="absolute inset-0 bg-[hsl(0_0%_7%)]/55" />
        <div className="relative z-10">
          <Wordmark variant="white" className="h-7" />
        </div>
        <div className="relative z-10 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Workforce Intelligence
          </p>
          <h1 className="text-5xl uppercase leading-[0.95] text-white">
            People data,<br />without limits.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/80 normal-case">
            One platform for headcount, Saudization, diversity, hiring, and
            employee relations &mdash; built for HR Business Partners and
            executives at HUMAIN.
          </p>
        </div>
        <div className="relative z-10 text-xs uppercase tracking-[0.2em] text-white/50">
          Enterprise HRBP Platform
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex flex-col items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Wordmark variant="black" className="h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl uppercase text-foreground">Sign in</h2>
            <p className="text-muted-foreground normal-case">
              Select a persona to continue to the platform.
            </p>
          </div>

          <div className="grid gap-3">
            {personas?.map((persona) => (
              <Card
                key={persona.key}
                className="group flex cursor-pointer items-center justify-between gap-4 p-4 transition-all hover:border-primary hover:shadow-sm"
                onClick={() => handleLogin(persona.key)}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{persona.label}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    <span className="font-medium text-foreground">{persona.role}</span>
                    {persona.businessUnitNames.length > 0 && ` \u2022 ${persona.businessUnitNames.join(', ')}`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Card>
            ))}
          </div>

          {loginMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in&hellip;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

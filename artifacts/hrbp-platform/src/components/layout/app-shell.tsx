import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Briefcase, 
  AlertTriangle, 
  UserMinus, 
  UserCheck, 
  Settings, 
  LogOut, 
  Menu,
  ShieldAlert,
  GraduationCap,
  Target,
  LineChart
} from "lucide-react";
import { useGetCurrentUser, useLogout, UserRole } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/comparison", label: "Comparison", icon: BarChart3, roles: [UserRole.CHRO, UserRole.HR_DIRECTOR, UserRole.ADMIN] },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/requisitions", label: "Requisitions", icon: Briefcase },
  { href: "/er-cases", label: "ER Cases", icon: AlertTriangle },
  { href: "/attrition", label: "Attrition", icon: UserMinus },
  { href: "/probation", label: "Probation", icon: UserCheck },
];

const futureNavItems = [
  { href: "/talent", label: "Talent Management", icon: GraduationCap },
  { href: "/succession", label: "Succession Planning", icon: Target },
  { href: "/performance", label: "Performance", icon: LineChart },
];

const adminNavItems = [
  { href: "/admin/users", label: "User Management", icon: Settings, roles: [UserRole.ADMIN] },
  { href: "/audit", label: "Audit Log", icon: ShieldAlert, roles: [UserRole.ADMIN] },
];

function NavLinks({ className, onClick }: { className?: string; onClick?: () => void }) {
  const [location] = useLocation();
  const { data: user } = useGetCurrentUser();
  
  if (!user) return null;

  const filterLinks = (items: any[]) => items.filter(item => !item.roles || item.roles.includes(user.role as UserRole));

  const renderLinks = (items: any[], disabled = false) => (
    <nav className={cn("space-y-1", className)}>
      {filterLinks(items).map((item) => {
        const isActive = location === item.href;
        if (disabled) {
           return (
            <div key={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/50 cursor-not-allowed">
              <item.icon className="h-4 w-4" />
              {item.label}
              <span className="ml-auto text-[10px] uppercase tracking-wider bg-sidebar-accent text-sidebar-foreground/70 px-1.5 py-0.5 rounded">Soon</span>
            </div>
           );
        }
        return (
          <Link key={item.href} href={item.href} onClick={onClick}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );

  const adminLinks = filterLinks(adminNavItems);

  return (
    <div className="flex-1 overflow-auto py-4 flex flex-col gap-6">
      <div className="px-3">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Core</div>
        {renderLinks(mainNavItems)}
      </div>
      
      <div className="px-3">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Modules</div>
        {renderLinks(futureNavItems, true)}
      </div>

      {adminLinks.length > 0 && (
        <div className="px-3 mt-auto">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Administration</div>
          {renderLinks(adminLinks)}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: user } = useGetCurrentUser();
  const logout = useLogout();
  const [_, setLocation] = useLocation();

  if (!user) return null;

  const initials = user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login")
    });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <Wordmark variant="white" className="h-5" />
          <span className="h-4 w-px bg-sidebar-border" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">HRBP</span>
        </div>
        <NavLinks />
        <div className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] bg-sidebar-primary text-sidebar-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 overflow-hidden">
                  <span className="text-sm font-medium leading-none truncate w-full">{user.displayName}</span>
                  <span className="text-xs text-sidebar-foreground/60 leading-none mt-1 truncate w-full">{user.role.replace('_', ' ')}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">Scope: {user.businessUnitName || 'Global'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-14 items-center gap-4 border-b bg-sidebar text-sidebar-foreground px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border">
              <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
                <Wordmark variant="white" className="h-5" />
                <span className="h-4 w-px bg-sidebar-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">HRBP</span>
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
          <Wordmark variant="white" className="h-4" />
          <div className="flex flex-1 items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.role.replace('_', ' ')}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-muted/30 p-4 md:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

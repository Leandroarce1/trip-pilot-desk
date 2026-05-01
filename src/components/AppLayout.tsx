import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Plane, DollarSign, Menu, X, Package,
  Bell, Building2, Target, GitBranch, Sparkles, Map, Ticket, UserCheck,
  IdCard, ArrowDownToLine, ArrowUpFromLine, Percent, Wallet, Boxes,
  MapPin, Brain, BarChart3, LineChart, ListTodo, Settings, ChevronLeft,
  ChevronRight, PanelLeftClose, PanelLeftOpen, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

type NavItem = {
  title: string;
  path: string;
  icon: typeof LayoutDashboard;
  comingSoon?: boolean;
};

type NavSection = {
  key: string;
  label: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    items: [
      { title: "Dashboard", path: "/", icon: LayoutDashboard },
    ],
  },
  {
    key: "comercial",
    label: "Comercial",
    items: [
      { title: "Pipeline", path: "/pipeline", icon: GitBranch },
      { title: "Oportunidades", path: "/oportunidades", icon: Sparkles },
      { title: "Propostas", path: "/cotacoes", icon: FileText },
    ],
  },
  {
    key: "operacao",
    label: "Operação",
    items: [
      { title: "Reservas", path: "/pacotes", icon: Package },
      { title: "Voos", path: "/voos", icon: Plane },
      { title: "Itinerários", path: "/itinerarios", icon: Map },
      { title: "Vouchers", path: "/vouchers", icon: Ticket },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    items: [
      { title: "Clientes", path: "/clientes", icon: Users },
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    items: [
      { title: "Recebimentos", path: "/financeiro?tab=receivables", icon: ArrowDownToLine },
      { title: "Pagamentos", path: "/financeiro?tab=payables", icon: ArrowUpFromLine },
      { title: "Comissões", path: "/financeiro?tab=commissions", icon: Percent },
      { title: "Fluxo de caixa", path: "/financeiro", icon: Wallet },
    ],
  },
  {
    key: "catalogo",
    label: "Catálogo",
    items: [
      { title: "Fornecedores", path: "/fornecedores", icon: Building2 },
    ],
  },
  {
    key: "sistema",
    label: "Sistema",
    items: [
      { title: "Notificações", path: "/alertas", icon: Bell },
    ],
  },
];

const COLLAPSED_KEY = "fd-sidebar-collapsed";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  });
  const location = useLocation();
  const { notifications } = useData();
  const { user, signOut } = useAuth();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const userInitial = (user?.email?.[0] ?? "A").toUpperCase();
  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
  };

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  if (location.pathname.startsWith("/reserva/")) {
    return <>{children}</>;
  }

  const isActivePath = (path: string) => {
    const [base] = path.split("?");
    if (base === "/") return location.pathname === "/";
    return location.pathname === base || location.pathname.startsWith(base + "/");
  };

  const sidebarWidth = collapsed ? "lg:w-16" : "lg:w-64";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarWidth,
        )}
      >
        {/* Logo + collapse toggle */}
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border shrink-0",
          collapsed ? "lg:justify-center lg:px-2" : "justify-between px-5",
        )}>
          {!collapsed && <Logo variant="dark" showTagline />}
          {collapsed && (
            <div className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-black text-sm">
              F
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-[hsl(var(--navy-hover))] transition-colors"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Nav sections */}
        <nav className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          collapsed ? "lg:px-1.5 lg:py-3 px-3 py-3" : "px-3 py-3",
        )}>
          {sections.map((section, idx) => (
            <div key={section.key} className={cn(idx > 0 && "mt-3")}>
              {/* Section divider + label */}
              {!collapsed ? (
                <div className="px-3 pb-1.5 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/40">
                    {section.label}
                  </p>
                </div>
              ) : (
                idx > 0 && <div className="hidden lg:block mx-2 my-2 h-px bg-sidebar-border/60" />
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActivePath(item.path);
                  const showBadge = item.path === "/alertas" && unreadCount > 0;
                  const Icon = item.icon;

                  const linkClass = cn(
                    "group relative flex items-center rounded-lg text-[13px] font-medium transition-all",
                    collapsed ? "lg:justify-center lg:px-2 lg:py-2.5 gap-3 px-3 py-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/85 hover:bg-[hsl(var(--navy-hover))] hover:text-sidebar-accent-foreground",
                    item.comingSoon && "opacity-60 cursor-not-allowed",
                  );

                  const content = (
                    <>
                      {/* Active accent bar */}
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[hsl(var(--gold))]" />
                      )}
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                        active && "text-[hsl(var(--gold))]",
                      )} />
                      {(!collapsed || sidebarOpen) && (
                        <>
                          <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.title}</span>
                          {item.comingSoon && (
                            <span className={cn(
                              "rounded-full bg-sidebar-foreground/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sidebar-foreground/50",
                              collapsed && "lg:hidden",
                            )}>
                              soon
                            </span>
                          )}
                          {showBadge && (
                            <span className={cn(
                              "flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground",
                              collapsed && "lg:hidden",
                            )}>
                              {unreadCount}
                            </span>
                          )}
                        </>
                      )}
                      {/* Tooltip for collapsed mode */}
                      {collapsed && (
                        <span className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 items-center gap-2 rounded-md bg-navy text-navy-foreground px-2.5 py-1.5 text-xs font-medium shadow-lg whitespace-nowrap pointer-events-none border border-sidebar-border">
                          {item.title}
                          {item.comingSoon && <span className="text-[9px] uppercase opacity-60">soon</span>}
                          {showBadge && (
                            <span className="rounded-full bg-destructive px-1.5 text-[9px] font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </span>
                      )}
                    </>
                  );

                  if (item.comingSoon) {
                    return (
                      <div
                        key={`${section.key}-${item.title}`}
                        className={linkClass}
                        title={`${item.title} (em breve)`}
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={`${section.key}-${item.title}`}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={linkClass}
                    >
                      {content}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-sidebar-border shrink-0",
          collapsed ? "lg:p-2 p-4" : "p-4",
        )}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary-soft))] flex items-center justify-center text-navy text-xs font-black shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">Agente</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">© 2026 FlowDestinos</p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary-soft))] flex items-center justify-center text-navy text-xs font-black">
                A
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/70 bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <NavLink
              to="/alertas"
              className="relative text-muted-foreground hover:text-primary transition-colors"
              aria-label="Alertas"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center" title={user?.email ?? ""}>
              <span className="text-xs font-bold text-navy-foreground">{userInitial}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

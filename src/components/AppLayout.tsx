import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Plane,
  DollarSign,
  Menu,
  X,
  Package,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { Logo } from "@/components/Logo";

type NavItem = {
  title: string;
  path: string;
  icon: typeof LayoutDashboard;
  group: "operação" | "gestão";
};

const navItems: NavItem[] = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard, group: "operação" },
  { title: "Clientes", path: "/clientes", icon: Users, group: "operação" },
  { title: "Cotações", path: "/cotacoes", icon: FileText, group: "operação" },
  { title: "Reservas", path: "/pacotes", icon: Package, group: "operação" },
  { title: "Voos", path: "/voos", icon: Plane, group: "operação" },
  { title: "Financeiro", path: "/financeiro", icon: DollarSign, group: "gestão" },
  { title: "Alertas", path: "/alertas", icon: Bell, group: "gestão" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { notifications } = useData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (location.pathname.startsWith("/reserva/")) {
    return <>{children}</>;
  }

  const groups: Array<{ key: NavItem["group"]; label: string; items: NavItem[] }> = [
    { key: "operação", label: "Operação", items: navItems.filter((i) => i.group === "operação") },
    { key: "gestão", label: "Gestão", items: navItems.filter((i) => i.group === "gestão") },
  ];

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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Logo variant="dark" showTagline />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 space-y-6 px-3 py-5 overflow-y-auto">
          {groups.map((group, idx) => (
            <div key={group.key}>
              {idx > 0 && <div className="mx-2 mb-4 h-px bg-sidebar-border" />}
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-[hsl(var(--navy-hover))] hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.path === "/alertas" && unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-bold text-sidebar-primary-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-sidebar-foreground/50">
            © 2026 FlowDestinos
          </p>
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
            <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center">
              <span className="text-xs font-bold text-navy-foreground">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

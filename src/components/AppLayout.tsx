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
  Globe,
  Package,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Clientes", path: "/clientes", icon: Users },
  { title: "Cotações", path: "/cotacoes", icon: FileText },
  { title: "Pacotes", path: "/pacotes", icon: Package },
  { title: "Voos", path: "/voos", icon: Plane },
  { title: "Financeiro", path: "/financeiro", icon: DollarSign },
  { title: "Alertas", path: "/alertas", icon: Bell },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { notifications } = useData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Don't show sidebar on booking page
  if (location.pathname.startsWith("/reserva/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Globe className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-accent-foreground">TravelCRM</h1>
            <p className="text-[10px] text-sidebar-foreground/60">Agência de Viagens</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.title}
                {item.path === "/alertas" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50">© 2026 TravelCRM</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/alertas" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

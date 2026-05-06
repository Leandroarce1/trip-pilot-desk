import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, CreditCard, Plane, AlertTriangle, Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/format";
import type { Notification } from "@/types/crm";

const iconMap = {
  checkin: Plane,
  payment: CreditCard,
  departure: AlertTriangle,
  general: Bell,
} as const;

const colorMap = {
  checkin: "bg-info/10 text-info",
  payment: "bg-warning/10 text-warning",
  departure: "bg-destructive/10 text-destructive",
  general: "bg-primary/10 text-primary",
} as const;

const typeLabel: Record<Notification["type"], string> = {
  checkin: "Check-in",
  payment: "Pagamento",
  departure: "Embarque",
  general: "Geral",
};

const Notifications = () => {
  const { notifications, markNotificationRead } = useData();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all | unread | read
  const [periodFilter, setPeriodFilter] = useState<string>("all"); // all | today | 7d | 30d

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const now = new Date();
    const cutoff = (() => {
      if (periodFilter === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      if (periodFilter === "7d") return now.getTime() - 7 * 86400000;
      if (periodFilter === "30d") return now.getTime() - 30 * 86400000;
      return 0;
    })();
    return notifications.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (statusFilter === "unread" && n.read) return false;
      if (statusFilter === "read" && !n.read) return false;
      if (cutoff && new Date(n.date).getTime() < cutoff) return false;
      if (term && !(n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [notifications, q, typeFilter, statusFilter, periodFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const counts = useMemo(() => {
    const c = { checkin: 0, payment: 0, departure: 0, general: 0 } as Record<string, number>;
    notifications.forEach((n) => { if (!n.read) c[n.type] = (c[n.type] ?? 0) + 1; });
    return c;
  }, [notifications]);

  const markAllVisible = async () => {
    for (const n of filtered) if (!n.read) await markNotificationRead(n.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Alertas</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} não lida(s) · {notifications.length} no total</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllVisible}>
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Marcar visíveis como lidas
          </Button>
        )}
      </div>

      {/* Resumo por tipo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(typeLabel) as Notification["type"][]).map((t) => {
          const Icon = iconMap[t];
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40",
                typeFilter === t && "border-primary bg-primary/5",
              )}
            >
              <div className={cn("rounded-lg p-2", colorMap[t])}><Icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{typeLabel[t]}</p>
                <p className="text-lg font-bold tabular-nums">{counts[t] ?? 0}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por título ou mensagem..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer data</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {filtered.length} resultado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma notificação encontrada</p>
          ) : (
            filtered.map((n) => {
              const Icon = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    !n.read && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className={cn("rounded-lg p-2", colorMap[n.type])}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm truncate", !n.read ? "font-semibold" : "font-medium")}>{n.title}</p>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                        {typeLabel[n.type]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 tabular-nums">{fmtDateTime(n.date)}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)} title="Marcar como lida">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;

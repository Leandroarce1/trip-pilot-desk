import { useState } from "react";
import { Bell, Check, CreditCard, Plane, AlertTriangle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap = {
  checkin: Plane,
  payment: CreditCard,
  departure: AlertTriangle,
  general: Bell,
};

const colorMap = {
  checkin: "bg-info/10 text-info",
  payment: "bg-warning/10 text-warning",
  departure: "bg-destructive/10 text-destructive",
  general: "bg-primary/10 text-primary",
};

const Notifications = () => {
  const { notifications, markNotificationRead, flights, transactions } = useData();

  // Generate dynamic alerts
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const checkinAlerts = flights.filter((f) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
    return dep >= now && dep <= in48h;
  });

  const pendingPayments = transactions.filter((t) => t.status === "pending" && t.type === "income");

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notificações e Alertas</h1>
        <p className="text-sm text-muted-foreground">{unreadCount} não lida(s)</p>
      </div>

      {/* Auto-generated alerts */}
      {(checkinAlerts.length > 0 || pendingPayments.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alertas Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {checkinAlerts.map((f) => (
              <div key={`checkin-${f.id}`} className="flex items-center gap-3 rounded-lg border border-info/30 bg-info/5 p-3">
                <div className="rounded-lg bg-info/15 p-2"><Plane className="h-4 w-4 text-info" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Check-in: {f.clientName}</p>
                  <p className="text-xs text-muted-foreground">{f.flightNumber} · {f.origin} → {f.destination} · {f.departureDate} {f.departureTime}</p>
                </div>
                <span className="text-[10px] font-semibold text-info bg-info/15 rounded-full px-2 py-0.5">48H</span>
              </div>
            ))}
            {pendingPayments.map((t) => (
              <div key={`payment-${t.id}`} className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="rounded-lg bg-warning/15 p-2"><CreditCard className="h-4 w-4 text-warning" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pagamento pendente</p>
                  <p className="text-xs text-muted-foreground">{t.description} · R$ {t.value.toLocaleString("pt-BR")}</p>
                </div>
                <span className="text-[10px] font-semibold text-warning bg-warning/15 rounded-full px-2 py-0.5">PENDENTE</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notification History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma notificação</p>
          ) : (
            notifications.map((n) => {
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
                    <p className={cn("text-sm", !n.read ? "font-semibold" : "font-medium")}>{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{n.date}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)}>
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

import { useNavigate } from "react-router-dom";
import {
  Plane, Users, FileText, DollarSign, TrendingUp, AlertTriangle,
  Clock, CalendarDays, Plus, ArrowUpRight, ArrowDownRight, CreditCard,
  MapPin, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fmtCurrency, fmtDate } from "@/lib/format";

const Dashboard = () => {
  const navigate = useNavigate();
  const { clients, flights, quotes, packages } = useData();

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const in5d = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const currentMonth = now.toISOString().slice(0, 7);

  // ----- KPIs based on RESERVATIONS (single source of truth) -----
  const monthConfirmed = packages.filter(
    (p) => p.reservationStatus === "confirmed" && p.departureDate.startsWith(currentMonth),
  );
  const monthRevenue = monthConfirmed.reduce((s, p) => s + p.totalValue, 0);
  const monthCommission = monthConfirmed.reduce((s, p) => s + (p.totalValue * p.commissionPercent) / 100, 0);

  const pendingPayments = packages.filter((p) => p.paymentStatus === "pending" && p.reservationStatus !== "cancelled");
  const pendingTotal = pendingPayments.reduce((s, p) => s + p.totalValue, 0);

  const upcomingReservations = packages.filter((p) => {
    if (p.reservationStatus === "cancelled") return false;
    const dep = new Date(p.departureDate);
    return dep >= now && dep <= in30d;
  });

  // Active clients = at least 1 non-cancelled reservation
  const activeClientIds = new Set(
    packages.filter((p) => p.reservationStatus !== "cancelled").map((p) => p.clientId),
  );

  const upcomingFlights = flights
    .filter((f) => new Date(`${f.departureDate}T${f.departureTime || "00:00"}`) >= now)
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());

  const checkinAlerts = upcomingFlights.filter((f) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
    return dep <= in48h;
  });

  const nearFlights = upcomingFlights.filter((f) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
    return dep <= in5d;
  });

  const weekReservations = packages.filter((p) => {
    if (p.reservationStatus === "cancelled") return false;
    const dep = new Date(p.departureDate);
    return dep >= now && dep <= in7d;
  });

  // Revenue/commission chart — last 4 months from confirmed reservations
  const chartData = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const monthPkgs = packages.filter(
      (p) => p.reservationStatus === "confirmed" && p.departureDate.startsWith(key),
    );
    const Receita = monthPkgs.reduce((s, p) => s + p.totalValue, 0);
    const Comissao = monthPkgs.reduce((s, p) => s + (p.totalValue * p.commissionPercent) / 100, 0);
    return { label: label.charAt(0).toUpperCase() + label.slice(1), Receita, Comissao };
  });

  const recentClients = [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const recentQuotes = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const kpis = [
    { title: "Faturamento", value: fmtCurrency(monthRevenue), icon: DollarSign, sub: "Reservas confirmadas no mês", trend: monthRevenue > 0 ? "up" : "neutral" as const },
    { title: "Lucro Estimado", value: fmtCurrency(monthCommission), icon: TrendingUp, sub: `${monthConfirmed.length} reserva(s) confirmada(s)`, trend: monthCommission > 0 ? "up" : "neutral" as const },
    { title: "Pgtos Pendentes", value: fmtCurrency(pendingTotal), icon: CreditCard, sub: `${pendingPayments.length} reserva(s) pendente(s)`, trend: pendingPayments.length > 0 ? "alert" : "neutral" as const },
    { title: "Próximas Viagens", value: upcomingReservations.length, icon: Plane, sub: "Embarque nos próximos 30 dias", trend: upcomingReservations.length > 0 ? "alert" : "neutral" as const },
    { title: "Clientes Ativos", value: activeClientIds.size, icon: Users, sub: `${clients.length} no total`, trend: "neutral" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="label-caption mb-1">Visão geral</p>
          <h1 className="text-3xl tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Centro de controle da sua agência</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums hidden sm:block">
          {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Featured navy widget */}
      <div className="relative overflow-hidden rounded-2xl bg-navy text-navy-foreground p-6">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[hsl(var(--primary-soft))]/10 blur-2xl" aria-hidden />
        <div className="absolute right-6 top-6 opacity-20" aria-hidden>
          <Plane className="h-20 w-20 -rotate-12" />
        </div>
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--primary-soft))]">
            Esta semana
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-navy-foreground">Próximas viagens esta semana</h2>
          <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-3">
            <div>
              <p className="text-4xl font-bold tabular-nums leading-none">{weekReservations.length}</p>
              <p className="text-xs text-[hsl(var(--primary-soft))] mt-2">embarques nos próximos 7 dias</p>
            </div>
            {checkinAlerts.length > 0 && (
              <div className="border-l border-white/15 pl-10">
                <p className="text-4xl font-bold tabular-nums leading-none text-[hsl(var(--gold))]">{checkinAlerts.length}</p>
                <p className="text-xs text-[hsl(var(--primary-soft))] mt-2">check-in(s) em até 48h</p>
              </div>
            )}
            <div className="border-l border-white/15 pl-10">
              <p className="text-4xl font-bold tabular-nums leading-none">{fmtCurrency(monthRevenue)}</p>
              <p className="text-xs text-[hsl(var(--primary-soft))] mt-2">faturamento do mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Alert Banner */}
      {checkinAlerts.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 flex items-start gap-3">
          <div className="rounded-lg bg-warning/15 p-2 mt-0.5">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Check-in necessário — {checkinAlerts.length} voo(s) nas próximas 48h</p>
            <div className="mt-2 space-y-1.5">
              {checkinAlerts.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{f.clientName} • {f.flightNumber}</span>
                  <span className="font-medium tabular-nums">{f.origin} → {f.destination} · {fmtDate(f.departureDate)} {f.departureTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-lg bg-secondary p-2">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
                {kpi.trend === "up" && <ArrowUpRight className="h-4 w-4 text-success" />}
                {kpi.trend === "down" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                {kpi.trend === "alert" && <Clock className="h-4 w-4 text-warning" />}
              </div>
              <p className="text-[28px] font-bold tracking-tight text-navy leading-none">{kpi.value}</p>
              <p className="label-caption mt-3">{kpi.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Operação em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingFlights.slice(0, 4).map((f) => {
              const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
              const isUrgent = dep <= in48h;
              const isNear = dep <= in5d;
              return (
                <div
                  key={f.id}
                  className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                    isUrgent ? "border-warning/40 bg-warning/5" : isNear ? "border-info/30 bg-info/5" : ""
                  }`}
                >
                  <div className={`rounded-lg p-2 ${isUrgent ? "bg-warning/15" : "bg-primary/10"}`}>
                    <Plane className={`h-4 w-4 ${isUrgent ? "text-warning" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.clientName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {f.origin} → {f.destination} · {f.airline} {f.flightNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{fmtDate(f.departureDate)}</p>
                    <p className="text-xs text-muted-foreground">{f.departureTime}</p>
                  </div>
                  {isUrgent && (
                    <span className="text-[10px] font-semibold text-warning bg-warning/15 rounded-full px-2 py-0.5 shrink-0">
                      CHECK-IN
                    </span>
                  )}
                </div>
              );
            })}

            {pendingPayments.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <CreditCard className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Pagamento pendente — {p.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.destinationCity}, {p.destinationCountry} · embarque {fmtDate(p.departureDate)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-destructive tabular-nums shrink-0">{fmtCurrency(p.totalValue)}</p>
              </div>
            ))}

            {upcomingFlights.length === 0 && pendingPayments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento pendente 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Receita vs. Comissão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={35} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [fmtCurrency(value)]}
                  />
                  <Bar dataKey="Receita" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Comissao" fill="hsl(var(--primary-soft))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <p className="text-xs text-muted-foreground">Faturamento mês</p>
                <p className="text-sm font-bold text-primary">{fmtCurrency(monthRevenue)}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-2.5">
                <p className="text-xs text-muted-foreground">Comissão mês</p>
                <p className="text-sm font-bold text-success">{fmtCurrency(monthCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Últimos Clientes
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/clientes")}>
              Ver todos <ChevronRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentClients.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/clientes/${c.id}`)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{fmtDate(c.createdAt)}</p>
                </div>
                <StatusBadge variant={c.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Últimas Cotações
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/cotacoes")}>
              Ver todas <ChevronRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentQuotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{q.destination}</p>
                  <p className="text-xs text-muted-foreground">{q.clientName} · {fmtCurrency(q.value)}</p>
                </div>
                <StatusBadge variant={q.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions — primary buttons for key flows */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            <Button className="h-auto py-3 flex-col gap-1.5 text-xs" onClick={() => navigate("/clientes")}>
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
            <Button className="h-auto py-3 flex-col gap-1.5 text-xs" onClick={() => navigate("/cotacoes")}>
              <Plus className="h-4 w-4" />
              Nova Cotação
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" onClick={() => navigate("/voos")}>
              <Plus className="h-4 w-4 text-primary" />
              Novo Voo
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" onClick={() => navigate("/financeiro")}>
              <Plus className="h-4 w-4 text-primary" />
              Lançamento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

import { useNavigate } from "react-router-dom";
import {
  Plane, Users, FileText, DollarSign, TrendingUp, AlertTriangle,
  Clock, CalendarDays, Plus, ArrowUpRight, ArrowDownRight, CreditCard,
  MapPin, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { clients, flights, quotes, transactions } = useData();

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const in5d = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const currentMonth = now.toISOString().slice(0, 7);

  // KPIs
  const monthIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + t.value, 0);
  const monthExpense = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + t.value, 0);
  const profit = monthIncome - monthExpense;
  const pendingPayments = transactions.filter((t) => t.status === "pending");
  const pendingTotal = pendingPayments.reduce((s, t) => s + t.value, 0);
  const activeClients = clients.filter((c) => c.status !== "lead").length;

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

  // Chart data — last 4 months
  const chartData = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const income = transactions.filter((t) => t.type === "income" && t.date.startsWith(key)).reduce((s, t) => s + t.value, 0);
    const expense = transactions.filter((t) => t.type === "expense" && t.date.startsWith(key)).reduce((s, t) => s + t.value, 0);
    return { label: label.charAt(0).toUpperCase() + label.slice(1), Receita: income, Despesa: expense };
  });

  const recentClients = [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const recentQuotes = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

  const kpis = [
    { title: "Faturamento", value: fmt(monthIncome), icon: DollarSign, sub: "Este mês", trend: monthIncome > 0 ? "up" : "neutral" as const },
    { title: "Lucro Estimado", value: fmt(profit), icon: TrendingUp, sub: `Margem ${monthIncome ? Math.round((profit / monthIncome) * 100) : 0}%`, trend: profit > 0 ? "up" : "down" as const },
    { title: "Pgtos Pendentes", value: fmt(pendingTotal), icon: CreditCard, sub: `${pendingPayments.length} pendente(s)`, trend: pendingPayments.length > 0 ? "alert" : "neutral" as const },
    { title: "Próximas Viagens", value: upcomingFlights.length, icon: Plane, sub: `${nearFlights.length} em 5 dias`, trend: nearFlights.length > 0 ? "alert" : "neutral" as const },
    { title: "Clientes Ativos", value: activeClients, icon: Users, sub: `${clients.length} total`, trend: "neutral" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Centro de controle da sua agência</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
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
                  <span className="font-medium">{f.origin} → {f.destination} · {f.departureDate} {f.departureTime}</span>
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
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
                {kpi.trend === "up" && <ArrowUpRight className="h-4 w-4 text-success" />}
                {kpi.trend === "down" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                {kpi.trend === "alert" && <Clock className="h-4 w-4 text-warning" />}
              </div>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Section: Events + Chart */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Events Timeline */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Operação em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upcoming Departures */}
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
                    <p className="text-sm font-semibold tabular-nums">{f.departureDate}</p>
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

            {/* Pending Payments in timeline */}
            {pendingPayments.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <CreditCard className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">Pagamento pendente · {t.date}</p>
                </div>
                <p className="text-sm font-semibold text-destructive tabular-nums shrink-0">{fmt(t.value)}</p>
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
              Resumo Financeiro
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
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [fmt(value)]}
                  />
                  <Bar dataKey="Receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-success/10 p-2.5">
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-sm font-bold text-success">{fmt(monthIncome)}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-2.5">
                <p className="text-xs text-muted-foreground">Saídas</p>
                <p className="text-sm font-bold text-destructive">{fmt(monthExpense)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5">
                <p className="text-xs text-muted-foreground">Lucro</p>
                <p className="text-sm font-bold text-primary">{fmt(profit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Clients */}
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
                  <p className="text-xs text-muted-foreground">{c.createdAt}</p>
                </div>
                <StatusBadge variant={c.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
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
                  <p className="text-xs text-muted-foreground">{q.clientName} · {fmt(q.value)}</p>
                </div>
                <StatusBadge variant={q.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" onClick={() => navigate("/clientes")}>
              <Plus className="h-4 w-4 text-primary" />
              Novo Cliente
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" onClick={() => navigate("/cotacoes")}>
              <Plus className="h-4 w-4 text-primary" />
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

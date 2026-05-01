import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane, Users, FileText, DollarSign, TrendingUp, AlertTriangle,
  Clock, Plus, ArrowUpRight, ArrowDownRight, CreditCard,
  MapPin, ChevronRight, Ticket, Target, UserPlus, Activity,
  Sparkles, Trophy, PieChart as PieIcon, MessageCircle, CheckCircle2,
  PhoneCall, Mail, CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Flame, Zap, ArrowUp, TrendingDown } from "lucide-react";

// ---------- Reusable inline components ----------

type Trend = "up" | "down" | "neutral" | "alert";

function KpiCard({
  title, value, sub, icon: Icon, trend = "neutral", accent, onClick,
}: {
  title: string; value: string | number; sub?: string;
  icon: typeof DollarSign; trend?: Trend; accent?: "primary" | "gold" | "success" | "warning" | "info";
  onClick?: () => void;
}) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    info: "bg-info-soft text-info-soft-foreground",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 text-left",
        "transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative flex items-start justify-between mb-3">
        <div className={cn("rounded-lg p-2", accentMap[accent ?? "primary"])}>
          <Icon className="h-4 w-4" />
        </div>
        {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-success" />}
        {trend === "down" && <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
        {trend === "alert" && <Clock className="h-3.5 w-3.5 text-warning" />}
      </div>
      <p className="relative text-[22px] font-bold tracking-tight text-navy leading-none tabular-nums">{value}</p>
      <p className="relative label-caption mt-2.5">{title}</p>
      {sub && <p className="relative text-[10.5px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </button>
  );
}

function PanelCard({
  title, icon: Icon, action, children, className,
}: {
  title: string; icon: typeof DollarSign;
  action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <Card className={cn("border-border/60 bg-card/80 backdrop-blur-sm shadow-sm", className)}>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[13px] font-semibold flex items-center gap-2 text-navy">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary-soft))",
  "hsl(var(--gold))",
  "hsl(var(--success))",
  "hsl(var(--info))",
];

// ---------- Page ----------

const Dashboard = () => {
  const navigate = useNavigate();
  const { clients, flights, quotes, packages, transactions, notifications } = useData();

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 3600 * 1000);
  const in7d = new Date(now.getTime() + 7 * 86400 * 1000);
  const in30d = new Date(now.getTime() + 30 * 86400 * 1000);
  const currentMonth = now.toISOString().slice(0, 7);

  // ----- KPI calculations -----
  const monthPkgs = packages.filter((p) => p.createdAt.startsWith(currentMonth));
  const monthSales = monthPkgs.length;

  const monthConfirmed = packages.filter(
    (p) => p.reservationStatus === "confirmed" && p.departureDate.startsWith(currentMonth),
  );
  const monthRevenue = monthConfirmed.reduce((s, p) => s + p.totalValue, 0);
  const monthCommission = monthConfirmed.reduce((s, p) => s + (p.totalValue * p.commissionPercent) / 100, 0);
  const margin = monthRevenue > 0 ? (monthCommission / monthRevenue) * 100 : 0;

  const ticketsIssued = flights.filter((f) => f.departureDate.startsWith(currentMonth)).length;

  const upcomingDepartures = packages.filter((p) => {
    if (p.reservationStatus === "cancelled") return false;
    const dep = new Date(p.departureDate);
    return dep >= now && dep <= in7d;
  });

  const pendingPayments = packages.filter((p) => p.paymentStatus === "pending" && p.reservationStatus !== "cancelled");
  const pendingTotal = pendingPayments.reduce((s, p) => s + p.totalValue, 0);

  const newLeads = clients.filter((c) => c.status === "lead" && c.createdAt.startsWith(currentMonth)).length;

  const totalLeads = clients.length;
  const soldClients = new Set(packages.filter((p) => p.reservationStatus === "confirmed").map((p) => p.clientId)).size;
  const conversion = totalLeads > 0 ? (soldClients / totalLeads) * 100 : 0;

  // ----- Pipeline -----
  const pipelineStages = [
    { key: "lead", label: "Leads", count: clients.filter((c) => c.status === "lead").length, color: "bg-info" },
    { key: "negotiation", label: "Em negociação", count: clients.filter((c) => c.status === "negotiation").length, color: "bg-warning" },
    { key: "quoting", label: "Cotando", count: packages.filter((p) => p.reservationStatus === "quoting").length, color: "bg-primary-soft" },
    { key: "pending", label: "Pendentes", count: packages.filter((p) => p.reservationStatus === "pending").length, color: "bg-[hsl(var(--gold))]" },
    { key: "confirmed", label: "Confirmadas", count: packages.filter((p) => p.reservationStatus === "confirmed").length, color: "bg-success" },
  ];
  const pipelineMax = Math.max(...pipelineStages.map((s) => s.count), 1);

  // ----- Follow-up hoje (leads + negotiation) -----
  const followUps = clients
    .filter((c) => c.status === "lead" || c.status === "negotiation")
    .slice(0, 5);

  // ----- Viagens próximas -----
  const nearTrips = packages
    .filter((p) => {
      if (p.reservationStatus === "cancelled") return false;
      const dep = new Date(p.departureDate);
      return dep >= now && dep <= in30d;
    })
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
    .slice(0, 5);

  // ----- Alertas importantes -----
  const checkinAlerts = flights.filter((f) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
    return dep >= now && dep <= in48h;
  });

  const importantAlerts = [
    ...checkinAlerts.map((f) => ({
      id: `ck-${f.id}`, kind: "checkin" as const,
      title: `Check-in em até 48h — ${f.clientName}`,
      sub: `${f.flightNumber} · ${f.origin} → ${f.destination} · ${fmtDate(f.departureDate)} ${f.departureTime}`,
    })),
    ...pendingPayments.slice(0, 3).map((p) => ({
      id: `pp-${p.id}`, kind: "payment" as const,
      title: `Pagamento pendente — ${p.clientName}`,
      sub: `${p.destinationCity}, ${p.destinationCountry} · ${fmtCurrency(p.totalValue)}`,
    })),
    ...notifications.filter((n) => !n.read).slice(0, 2).map((n) => ({
      id: `nt-${n.id}`, kind: "general" as const, title: n.title, sub: n.message,
    })),
  ].slice(0, 6);

  // ----- Top destinos vendidos (cidade + país) -----
  const topDestinations = useMemo(() => {
    const map = new Map<string, { name: string; country: string; flag?: string; sales: number; revenue: number }>();
    packages.filter((p) => p.reservationStatus !== "cancelled").forEach((p) => {
      const key = `${p.destinationCity}|${p.destinationCountry}`;
      const cur = map.get(key) || { name: p.destinationCity, country: p.destinationCountry, flag: p.destinationFlag, sales: 0, revenue: 0 };
      cur.sales += 1; cur.revenue += p.totalValue;
      map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [packages]);
  const destMaxRev = Math.max(...topDestinations.map((s) => s.revenue), 1);

  // ----- Vendas por categoria (tipo de viagem) -----
  const categoryLabels: Record<string, string> = {
    air: "Aéreo", package: "Pacote", cruise: "Cruzeiro", road: "Rodoviário", hotel: "Hotel",
  };
  const categoryStats = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    packages.filter((p) => p.reservationStatus !== "cancelled").forEach((p) => {
      const label = categoryLabels[p.tripType] ?? p.tripType;
      const cur = map.get(label) || { name: label, value: 0 };
      cur.value += p.totalValue;
      map.set(label, cur);
    });
    return [...map.values()].sort((a, b) => b.value - a.value);
  }, [packages]);

  // ----- Receitas x Despesas (4 meses) -----
  const finChart = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const Receitas = transactions.filter((t) => t.type === "income" && t.date.startsWith(key)).reduce((s, t) => s + t.value, 0);
    const Despesas = transactions.filter((t) => t.type === "expense" && t.date.startsWith(key)).reduce((s, t) => s + t.value, 0);
    return { label: label.charAt(0).toUpperCase() + label.slice(1), Receitas, Despesas };
  });

  // ----- Vendas por destino (país) — usado em legendas/insights -----
  const destStats = useMemo(() => {
    const map = new Map<string, { name: string; flag?: string; value: number }>();
    packages.filter((p) => p.reservationStatus !== "cancelled").forEach((p) => {
      const cur = map.get(p.destinationCountry) || { name: p.destinationCountry, flag: p.destinationFlag, value: 0 };
      cur.value += p.totalValue; map.set(p.destinationCountry, cur);
    });
    return [...map.values()].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [packages]);

  // ----- Atividades recentes -----
  const activities = useMemo(() => {
    const items: { id: string; ts: string; icon: typeof Plus; text: string; tone: string }[] = [];
    packages.forEach((p) =>
      p.history.forEach((h, i) =>
        items.push({ id: `${p.id}-${i}`, ts: h.date, icon: Plane, text: `${h.action} — ${p.clientName} · ${p.destinationCity}`, tone: "text-primary" }),
      ),
    );
    quotes.slice(0, 3).forEach((q) =>
      items.push({ id: `q-${q.id}`, ts: q.createdAt, icon: FileText, text: `Cotação criada — ${q.destination} · ${q.clientName}`, tone: "text-info-soft-foreground" }),
    );
    clients.slice(0, 3).forEach((c) =>
      items.push({ id: `c-${c.id}`, ts: c.createdAt, icon: UserPlus, text: `Cliente cadastrado — ${c.name}`, tone: "text-success" }),
    );
    return items.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 8);
  }, [packages, quotes, clients]);

  // ----- IA Concierge insights -----
  const aiInsights = [
    upcomingDepartures.length > 0
      ? `${upcomingDepartures.length} embarque(s) nos próximos 7 dias — confirme documentação dos passageiros.`
      : "Nenhum embarque iminente — momento ideal para nutrir leads.",
    pendingPayments.length > 0
      ? `${pendingPayments.length} reserva(s) com pagamento pendente totalizando ${fmtCurrency(pendingTotal)}.`
      : "Carteira em dia — sem pagamentos pendentes.",
    newLeads >= 2
      ? `${newLeads} novos leads no mês. Agende follow-up com os mais quentes.`
      : "Considere ações de captação — leads novos abaixo da média.",
    destStats[0] ? `Destino campeão do mês: ${destStats[0].flag ?? ""} ${destStats[0].name} (${fmtCurrency(destStats[0].value)}).` : "",
  ].filter(Boolean);

  // ----- KPI definitions -----
  const kpis: Array<Parameters<typeof KpiCard>[0]> = [
    { title: "Vendas do mês", value: monthSales, sub: `${monthPkgs.length} reservas criadas`, icon: Ticket, accent: "primary", trend: monthSales > 0 ? "up" : "neutral", onClick: () => navigate("/pacotes") },
    { title: "Receita confirmada", value: fmtCurrency(monthRevenue), sub: `${monthConfirmed.length} confirmadas`, icon: DollarSign, accent: "success", trend: monthRevenue > 0 ? "up" : "neutral", onClick: () => navigate("/financeiro") },
    { title: "Margem", value: `${margin.toFixed(1)}%`, sub: `Comissão ${fmtCurrency(monthCommission)}`, icon: TrendingUp, accent: "primary", trend: margin > 8 ? "up" : "neutral" },
    { title: "Tickets emitidos", value: ticketsIssued, sub: "Voos no mês corrente", icon: Plane, accent: "info", trend: "neutral", onClick: () => navigate("/voos") },
    { title: "Embarques próximos", value: upcomingDepartures.length, sub: "Próximos 7 dias", icon: CalendarClock, accent: "gold", trend: upcomingDepartures.length > 0 ? "alert" : "neutral", onClick: () => navigate("/pacotes") },
    { title: "Pendências financeiras", value: fmtCurrency(pendingTotal), sub: `${pendingPayments.length} reserva(s)`, icon: CreditCard, accent: "warning", trend: pendingPayments.length > 0 ? "alert" : "neutral", onClick: () => navigate("/financeiro") },
    { title: "Leads novos", value: newLeads, sub: "Captados este mês", icon: UserPlus, accent: "info", trend: newLeads > 0 ? "up" : "neutral", onClick: () => navigate("/clientes") },
    { title: "Conversão", value: `${conversion.toFixed(0)}%`, sub: `${soldClients}/${totalLeads} clientes`, icon: Target, accent: "success", trend: conversion > 30 ? "up" : "neutral" },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Soft ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-[hsl(var(--gold))]/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-caption mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Command Center
          </p>
          <h1 className="text-3xl tracking-tight">Bom dia, Agente ✈️</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tudo que importa na sua agência, em uma tela.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground tabular-nums hidden sm:block">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <Button size="sm" onClick={() => navigate("/cotacoes")} className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova cotação
          </Button>
        </div>
      </div>

      {/* 1) Header KPI cards */}
      <section className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
      </section>

      {/* 2) Main grid */}
      <section className="grid gap-5 lg:grid-cols-12">
        {/* Pipeline */}
        <PanelCard title="Pipeline de vendas" icon={Activity} className="lg:col-span-6"
          action={<Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/pacotes")}>Ver detalhes <ChevronRight className="h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            {pipelineStages.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="tabular-nums font-semibold text-navy">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", s.color)}
                    style={{ width: `${(s.count / pipelineMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        {/* Follow-up hoje */}
        <PanelCard title="Follow-up hoje" icon={PhoneCall} className="lg:col-span-6"
          action={<Badge variant="warning">{followUps.length}</Badge>}
        >
          <div className="space-y-2">
            {followUps.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Sem follow-ups pendentes 🎉</p>}
            {followUps.map((c) => (
              <div key={c.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 hover:bg-muted/40 cursor-pointer transition-colors"
                onClick={() => navigate(`/clientes/${c.id}`)}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-soft))] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.phone} · {c.email}</p>
                </div>
                <StatusBadge variant={c.status} />
              </div>
            ))}
          </div>
        </PanelCard>

        {/* Viagens próximas */}
        <PanelCard title="Viagens próximas" icon={Plane} className="lg:col-span-7"
          action={<Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/pacotes")}>Todas <ChevronRight className="h-3 w-3" /></Button>}
        >
          <div className="space-y-2">
            {nearTrips.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhum embarque agendado.</p>}
            {nearTrips.map((p) => {
              const days = Math.ceil((new Date(p.departureDate).getTime() - now.getTime()) / 86400000);
              return (
                <div key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/pacotes/${p.id}`)}
                >
                  <div className="text-2xl shrink-0" aria-hidden>{p.destinationFlag ?? "🌍"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.clientName}</p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{p.destinationCity}, {p.destinationCountry}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums text-navy">{fmtDate(p.departureDate)}</p>
                    <p className="text-[10.5px] text-muted-foreground">em {days} dia{days !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>

        {/* Alertas importantes */}
        <PanelCard title="Alertas importantes" icon={AlertTriangle} className="lg:col-span-5"
          action={<Badge variant="destructive">{importantAlerts.length}</Badge>}
        >
          <div className="space-y-2">
            {importantAlerts.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhum alerta. Você está em dia 👌</p>}
            {importantAlerts.map((a) => {
              const tone =
                a.kind === "checkin" ? "border-warning/40 bg-warning/5" :
                a.kind === "payment" ? "border-destructive/30 bg-destructive/5" :
                "border-info/30 bg-info-soft";
              const Icon = a.kind === "checkin" ? Clock : a.kind === "payment" ? CreditCard : AlertTriangle;
              const iconTone =
                a.kind === "checkin" ? "text-warning bg-warning/15" :
                a.kind === "payment" ? "text-destructive bg-destructive/10" :
                "text-primary bg-primary/10";
              return (
                <div key={a.id} className={cn("flex items-start gap-2.5 rounded-lg border p-2.5", tone)}>
                  <div className={cn("rounded-md p-1.5 mt-0.5", iconTone)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </section>

      {/* 3) Secondary grid */}
      <section className="grid gap-5 lg:grid-cols-12">
        {/* Top destinos vendidos */}
        <PanelCard title="Top destinos vendidos" icon={Trophy} className="lg:col-span-4">
          <div className="space-y-3">
            {topDestinations.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Sem vendas registradas.</p>}
            {topDestinations.map((s, i) => (
              <div key={`${s.name}-${s.country}`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium flex items-center gap-2 min-w-0">
                    <span className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                      i === 0 ? "bg-[hsl(var(--gold))] text-[hsl(var(--gold-foreground))]" : "bg-muted text-muted-foreground",
                    )}>{i + 1}</span>
                    <span className="truncate">{s.flag ?? "🌍"} {s.name}, {s.country}</span>
                  </span>
                  <span className="tabular-nums font-semibold text-navy shrink-0">{fmtCurrency(s.revenue)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-soft))]"
                    style={{ width: `${(s.revenue / destMaxRev) * 100}%` }} />
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">{s.sales} reserva(s)</p>
              </div>
            ))}
          </div>
        </PanelCard>

        {/* Receitas x Despesas */}
        <PanelCard title="Receitas × Despesas" icon={TrendingUp} className="lg:col-span-4">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={32} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [fmtCurrency(value)]}
                />
                <Bar dataKey="Receitas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        {/* Vendas por categoria */}
        <PanelCard title="Vendas por categoria" icon={PieIcon} className="lg:col-span-4">
          {categoryStats.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Sem dados.</p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryStats} dataKey="value" nameKey="name" cx="40%" cy="50%" innerRadius={32} outerRadius={62} paddingAngle={2}>
                    {categoryStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number) => [fmtCurrency(v)]}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </PanelCard>

        {/* IA Concierge — full width */}
        <PanelCard title="IA Concierge" icon={Sparkles} className="lg:col-span-12">
          <div className="rounded-xl bg-gradient-to-br from-navy via-[hsl(var(--navy-hover))] to-[hsl(var(--navy-active))] text-navy-foreground p-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--primary-soft))]/20 blur-2xl" aria-hidden />
            <div className="absolute right-4 bottom-4 opacity-20" aria-hidden><Sparkles className="h-16 w-16" /></div>
            <div className="relative grid gap-3 sm:grid-cols-2">
              {aiInsights.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--gold))] shrink-0 mt-0.5" />
                  <p className="text-[12.5px] leading-relaxed text-navy-foreground/90">{t}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5 bg-white/10 hover:bg-white/20 text-navy-foreground border-white/20"
                onClick={() => navigate("/cotacoes")}>
                <FileText className="h-3.5 w-3.5" /> Sugerir nova cotação
              </Button>
              <Button size="sm" variant="secondary" className="gap-1.5 bg-white/10 hover:bg-white/20 text-navy-foreground border-white/20"
                onClick={() => navigate("/clientes")}>
                <Mail className="h-3.5 w-3.5" /> Disparar follow-up
              </Button>
            </div>
          </div>
        </PanelCard>
      </section>

      {/* 4) Footer — Atividades recentes */}
      <PanelCard title="Atividades recentes" icon={Activity}>
        <div className="relative pl-4">
          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="relative flex items-start gap-3">
                <span className={cn("absolute -left-3 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card", a.tone)} />
                <a.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", a.tone)} />
                <p className="text-xs text-foreground flex-1 truncate">{a.text}</p>
                <span className="text-[10.5px] text-muted-foreground tabular-nums shrink-0">{fmtDate(a.ts)}</span>
              </li>
            ))}
            {activities.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma atividade ainda.</p>}
          </ul>
        </div>
      </PanelCard>
    </div>
  );
};

export default Dashboard;

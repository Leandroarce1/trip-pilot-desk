import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane, Users, FileText, DollarSign, TrendingUp, AlertTriangle,
  Clock, Plus, ArrowUpRight, ArrowDownRight, CreditCard,
  MapPin, ChevronRight, Ticket, Target, UserPlus, Activity,
  Sparkles, Trophy, PieChart as PieIcon, MessageCircle, CheckCircle2,
  PhoneCall, Mail, CalendarClock, MessageSquare, ListTodo, ExternalLink,
  FileCheck, ShieldCheck, Hourglass, Siren,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Flame, Zap, ArrowUp, TrendingDown } from "lucide-react";

// ---------- Reusable inline components ----------

type Trend = "up" | "down" | "neutral" | "alert";

function KpiCard({
  title, value, sub, icon: Icon, trend = "neutral", accent, onClick, deltaPct, spark,
}: {
  title: string; value: string | number; sub?: string;
  icon: typeof DollarSign; trend?: Trend;
  accent?: "primary" | "gold" | "success" | "warning" | "info";
  onClick?: () => void;
  deltaPct?: number;
  spark?: number[];
}) {
  const accentMap = {
    primary: { chip: "bg-primary/10 text-primary", glow: "from-primary/15", stroke: "hsl(var(--primary))" },
    gold:    { chip: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]", glow: "from-[hsl(var(--gold))]/15", stroke: "hsl(var(--gold))" },
    success: { chip: "bg-success/10 text-success", glow: "from-success/15", stroke: "hsl(var(--success))" },
    warning: { chip: "bg-warning/15 text-warning", glow: "from-warning/15", stroke: "hsl(var(--warning))" },
    info:    { chip: "bg-info-soft text-info-soft-foreground", glow: "from-info/15", stroke: "hsl(var(--info))" },
  } as const;
  const a = accentMap[accent ?? "primary"];
  const sparkData = (spark && spark.length ? spark : [2, 3, 2.5, 4, 3.5, 5, 4.5]).map((v, i) => ({ i, v }));
  const deltaUp = (deltaPct ?? 0) >= 0;
  const showDelta = typeof deltaPct === "number" && Number.isFinite(deltaPct);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-5 text-left",
        "min-h-[168px] flex flex-col justify-between",
        "shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_16px_-4px_rgba(11,31,58,0.06)]",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_28px_-6px_rgba(11,31,58,0.18)] hover:border-primary/40 hover:bg-card/90",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      {/* Accent glow on hover */}
      <div className={cn("absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none", a.glow)} />

      {/* Top row: icon + delta badge */}
      <div className="relative flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5 ring-1 ring-inset ring-white/40", a.chip)}>
          <Icon className="h-5 w-5" />
        </div>
        {showDelta ? (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums",
            deltaUp ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
          )}>
            {deltaUp ? <ArrowUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {deltaUp ? "+" : ""}{deltaPct!.toFixed(0)}%
          </span>
        ) : trend === "alert" ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/15 text-warning px-2 py-0.5 text-[10.5px] font-bold">
            <Clock className="h-2.5 w-2.5" /> agora
          </span>
        ) : null}
      </div>

      {/* Value + label */}
      <div className="relative">
        <p className="text-[28px] font-bold tracking-tight text-navy leading-none tabular-nums">{value}</p>
        <p className="label-caption mt-2.5">{title}</p>
        {sub && <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>

      {/* Sparkline */}
      <div className="relative h-9 -mx-1 -mb-1 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${a.stroke.replace(/[^a-z]/gi, "")}-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={a.stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={a.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={a.stroke} strokeWidth={1.75}
              fill={`url(#spark-${a.stroke.replace(/[^a-z]/gi, "")}-${title.replace(/\s/g, "")})`}
              isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
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

function ActionCard({
  tone, icon: Icon, label, count, primary, secondary, actionLabel, onAction, urgent,
}: {
  tone: "info" | "warning" | "destructive" | "gold";
  icon: typeof DollarSign;
  label: string;
  count: number;
  primary: string;
  secondary: string;
  actionLabel: string;
  onAction: () => void;
  urgent?: boolean;
}) {
  const toneMap = {
    info: {
      gradient: "from-info/[0.12] via-info/[0.06] to-transparent",
      border: "border-info/40",
      iconBg: "bg-info text-white",
      number: "text-info",
      btn: "bg-info hover:bg-info/90 text-white shadow-[0_4px_14px_-4px_hsl(var(--info)/0.5)]",
      badge: "bg-info/15 text-info border-info/30",
      badgeLabel: "ATENÇÃO",
      glow: "bg-info/20",
    },
    warning: {
      gradient: "from-warning/[0.14] via-warning/[0.06] to-transparent",
      border: "border-warning/45",
      iconBg: "bg-warning text-white",
      number: "text-warning",
      btn: "bg-warning hover:bg-warning/90 text-white shadow-[0_4px_14px_-4px_hsl(var(--warning)/0.5)]",
      badge: "bg-warning/15 text-warning border-warning/30",
      badgeLabel: "AÇÃO HOJE",
      glow: "bg-warning/25",
    },
    destructive: {
      gradient: "from-destructive/[0.14] via-destructive/[0.06] to-transparent",
      border: "border-destructive/45",
      iconBg: "bg-destructive text-white",
      number: "text-destructive",
      btn: "bg-destructive hover:bg-destructive/90 text-white shadow-[0_4px_14px_-4px_hsl(var(--destructive)/0.5)]",
      badge: "bg-destructive/15 text-destructive border-destructive/30",
      badgeLabel: "URGENTE",
      glow: "bg-destructive/25",
    },
    gold: {
      gradient: "from-[hsl(var(--gold))]/[0.16] via-[hsl(var(--gold))]/[0.07] to-transparent",
      border: "border-[hsl(var(--gold))]/50",
      iconBg: "bg-[hsl(var(--gold))] text-[hsl(var(--gold-foreground))]",
      number: "text-[hsl(var(--gold))]",
      btn: "bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(var(--gold-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--gold)/0.55)]",
      badge: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30",
      badgeLabel: "EM 48H",
      glow: "bg-[hsl(var(--gold))]/25",
    },
  } as const;
  const t = toneMap[tone];
  const isEmpty = count === 0;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border-2 bg-card p-5 flex flex-col gap-4",
      "min-h-[200px] transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-2xl",
      isEmpty
        ? "border-border/40 bg-muted/20 opacity-75"
        : cn("bg-gradient-to-br shadow-lg", t.gradient, t.border),
      urgent && !isEmpty && "ring-2 ring-offset-2 ring-offset-background ring-destructive/20",
    )}>
      {/* Glow blob */}
      {!isEmpty && (
        <div className={cn("absolute -top-20 -right-20 h-44 w-44 rounded-full blur-3xl opacity-60 pointer-events-none", t.glow)} />
      )}

      {/* Header: icon + badge */}
      <div className="relative flex items-start justify-between">
        <div className={cn(
          "rounded-2xl p-3 shadow-lg",
          isEmpty ? "bg-muted text-muted-foreground" : t.iconBg,
          urgent && !isEmpty && "animate-pulse",
        )}>
          <Icon className="h-7 w-7" strokeWidth={2.25} />
        </div>
        {!isEmpty ? (
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
            t.badge,
          )}>
            {urgent && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
            {t.badgeLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success border border-success/30 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" /> Em dia
          </span>
        )}
      </div>

      {/* Big number + label */}
      <div className="relative flex-1">
        <p className={cn(
          "text-[56px] font-black leading-none tracking-tighter tabular-nums",
          isEmpty ? "text-muted-foreground/50" : t.number,
        )}>
          {count}
        </p>
        <p className="text-[13px] font-bold text-navy mt-1.5 uppercase tracking-wide">{label}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
          {isEmpty ? "Nada pendente nesta categoria 🎉" : secondary}
        </p>
        {!isEmpty && primary !== `${count}` && primary !== `${count} cliente` && primary !== `${count} clientes` && (
          <p className="text-[11px] font-semibold text-navy/70 tabular-nums mt-0.5">{primary}</p>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={onAction}
        disabled={isEmpty}
        className={cn(
          "relative w-full h-10 text-sm font-bold gap-1.5",
          !isEmpty ? t.btn : "bg-muted text-muted-foreground hover:bg-muted",
        )}
      >
        {isEmpty ? "Sem ações" : actionLabel}
        {!isEmpty && <ArrowUpRight className="h-4 w-4" />}
      </Button>
    </div>
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
  const avgTicket = monthConfirmed.length > 0 ? monthRevenue / monthConfirmed.length : 0;

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

  const supplierDeadlineAlerts = packages
    .filter((p) => {
      if (!p.supplierDeadline || p.paymentStatus === "paid" || p.reservationStatus === "cancelled") return false;
      const d = Math.ceil((new Date(p.supplierDeadline).getTime() - Date.now()) / 86400000);
      return d <= 7;
    })
    .sort((a, b) => (a.supplierDeadline! < b.supplierDeadline! ? -1 : 1));

  const importantAlerts = [
    ...supplierDeadlineAlerts.slice(0, 3).map((p) => {
      const d = Math.ceil((new Date(p.supplierDeadline!).getTime() - Date.now()) / 86400000);
      return {
        id: `sd-${p.id}`, kind: "payment" as const,
        title: d < 0 ? `Pagamento ao fornecedor ATRASADO — ${p.clientName}` : `Pagamento ao fornecedor em ${d}d — ${p.clientName}`,
        sub: `${p.supplier || "Fornecedor"} · ${p.destinationCity} · ${fmtCurrency(p.totalValue)} · vence ${fmtDate(p.supplierDeadline!)}`,
      };
    }),
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

  // ----- Receitas x Despesas (6 meses) -----
  const finChart = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
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

  // ----- Séries de 6 meses para sparklines + deltas -----
  const monthKeys = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toISOString().slice(0, 7);
  });
  const prevMonthKey = monthKeys[monthKeys.length - 2];

  const series = useMemo(() => {
    return {
      sales: monthKeys.map((k) => packages.filter((p) => p.createdAt.startsWith(k)).length),
      revenue: monthKeys.map((k) =>
        packages.filter((p) => p.reservationStatus === "confirmed" && p.departureDate.startsWith(k))
          .reduce((s, p) => s + p.totalValue, 0)),
      tickets: monthKeys.map((k) => flights.filter((f) => f.departureDate.startsWith(k)).length),
      pending: monthKeys.map((k) =>
        packages.filter((p) => p.paymentStatus === "pending" && p.reservationStatus !== "cancelled" && p.createdAt.startsWith(k))
          .reduce((s, p) => s + p.totalValue, 0)),
      leads: monthKeys.map((k) => clients.filter((c) => c.status === "lead" && c.createdAt.startsWith(k)).length),
      departures: monthKeys.map((k) =>
        packages.filter((p) => p.reservationStatus !== "cancelled" && p.departureDate.startsWith(k)).length),
    };
  }, [packages, flights, clients, monthKeys.join(",")]);

  const pct = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };

  const prevRevenue = packages.filter((p) => p.reservationStatus === "confirmed" && p.departureDate.startsWith(prevMonthKey))
    .reduce((s, p) => s + p.totalValue, 0);
  const prevSales = packages.filter((p) => p.createdAt.startsWith(prevMonthKey)).length;
  const prevTickets = flights.filter((f) => f.departureDate.startsWith(prevMonthKey)).length;
  const prevLeads = clients.filter((c) => c.status === "lead" && c.createdAt.startsWith(prevMonthKey)).length;

  // ----- IA Concierge — 4 painéis inteligentes -----
  // Clientes quentes: leads/negotiation com cotação enviada nos últimos 14 dias
  const cutoffHot = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10);
  const hotClients = clients
    .filter((c) => (c.status === "lead" || c.status === "negotiation"))
    .map((c) => {
      const recentQuotes = quotes.filter((q) => q.clientId === c.id && q.createdAt >= cutoffHot);
      const score = recentQuotes.length * 2 + (c.status === "negotiation" ? 3 : 1);
      return { client: c, score, lastQuote: recentQuotes[0] };
    })
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Viagens urgentes: embarque ≤ 7 dias
  const urgentTrips = nearTrips.slice(0, 3);

  // Upsell: clientes 'sold' ou 'recurring' sem reserva ativa nos próximos 60d
  const in60d = new Date(now.getTime() + 60 * 86400000);
  const upsellTargets = clients
    .filter((c) => c.status === "sold" || c.status === "recurring" || c.status === "postSale")
    .filter((c) => !packages.some((p) => p.clientId === c.id && new Date(p.departureDate) > now && new Date(p.departureDate) <= in60d))
    .slice(0, 3);

  // Alertas financeiros: pagamentos pendentes
  const finAlerts = pendingPayments.slice(0, 3);

  // ----- AÇÃO HOJE — 4 buckets prioritários -----
  // 1) Clientes a responder hoje: leads + negociação
  const toRespondToday = clients.filter((c) => c.status === "lead" || c.status === "negotiation");

  // 2) Propostas vencendo: cotações 'sent' com endDate ≤ 7 dias
  const expiringQuotes = quotes.filter((q) => {
    if (q.status !== "sent") return false;
    const end = new Date(q.endDate);
    return end >= now && end <= in7d;
  });

  // 3) Pagamentos atrasados: pendentes com embarque já passado OU em ≤ 14 dias
  const in14d = new Date(now.getTime() + 14 * 86400000);
  const overduePayments = pendingPayments.filter((p) => {
    const dep = new Date(p.departureDate);
    return dep <= in14d;
  });
  const overdueTotal = overduePayments.reduce((s, p) => s + p.totalValue, 0);

  // 4) Viagens em 48h
  const trips48h = packages.filter((p) => {
    if (p.reservationStatus === "cancelled") return false;
    const dep = new Date(p.departureDate);
    return dep >= now && dep <= in48h;
  });

  // ----- Follow-up enriquecido (tempo sem resposta + valor potencial) -----
  const followUpsRich = clients
    .filter((c) => c.status === "lead" || c.status === "negotiation")
    .map((c) => {
      const cQuotes = quotes.filter((q) => q.clientId === c.id);
      const lastQuote = cQuotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      const refDate = lastQuote?.createdAt || c.createdAt;
      const daysSilent = Math.max(0, Math.floor((now.getTime() - new Date(refDate).getTime()) / 86400000));
      const potential = cQuotes.reduce((s, q) => Math.max(s, q.value), 0);
      return { client: c, daysSilent, potential, lastQuote };
    })
    .sort((a, b) => (b.potential - a.potential) || (b.daysSilent - a.daysSilent))
    .slice(0, 5);

  // ----- Viagens próximas com status operacional (check-in / voucher / docs) -----
  const nearTripsRich = nearTrips.map((p) => {
    const days = Math.ceil((new Date(p.departureDate).getTime() - now.getTime()) / 86400000);
    const hasFlights = flights.some((f) => f.packageId === p.id);
    const checkinReady = days <= 2 && hasFlights;
    const voucherReady = p.reservationStatus === "confirmed" && !!p.confirmationCode;
    const docsReady = p.documents && p.documents.length > 0;
    return { pkg: p, days, checkinReady, voucherReady, docsReady };
  });

  // ----- Agenda da Agência (próximos 7 dias) -----
  const in7dStr = in7d.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);

  const birthdaysSoon = clients
    .filter((c) => c.profile?.birthDate)
    .map((c) => {
      const bd = c.profile!.birthDate!;
      const [, m, d] = bd.split("-");
      const thisYear = new Date(`${now.getFullYear()}-${m}-${d}`);
      if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1);
      const days = Math.ceil((thisYear.getTime() - now.getTime()) / 86400000);
      return { client: c, date: thisYear.toISOString().slice(0, 10), days };
    })
    .filter((x) => x.days <= 7 && x.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const payablesDue = transactions
    .filter((t) => t.type === "expense" && t.status === "pending" && t.date <= in7dStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const receivablesDue = transactions
    .filter((t) => t.type === "income" && t.status === "pending" && t.date <= in7dStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const flightsSoon = flights
    .filter((f) => f.departureDate >= todayStr && f.departureDate <= in7dStr)
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
    .slice(0, 5);

  const tripsSoon = packages
    .filter((p) => p.reservationStatus !== "cancelled" && p.departureDate >= todayStr && p.departureDate <= in7dStr)
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
    .slice(0, 5);

  // ----- Top clientes mais valiosos -----
  const topClients = useMemo(() => {
    const map = new Map<string, { id: string; name: string; revenue: number; trips: number; lastTrip?: string }>();
    packages.filter((p) => p.reservationStatus !== "cancelled").forEach((p) => {
      const cur = map.get(p.clientId) || { id: p.clientId, name: p.clientName, revenue: 0, trips: 0, lastTrip: undefined as string | undefined };
      cur.revenue += p.totalValue;
      cur.trips += 1;
      if (!cur.lastTrip || p.departureDate > cur.lastTrip) cur.lastTrip = p.departureDate;
      map.set(p.clientId, cur);
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [packages]);
  const topClientsMax = Math.max(...topClients.map((c) => c.revenue), 1);

  // ----- Tendência 6 meses (linha) -----
  const trendChart = monthKeys.map((k, i) => {
    const d = new Date(`${k}-01`);
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      Vendas: series.sales[i],
      Receita: series.revenue[i],
    };
  });

  // ----- KPI definitions -----
  const kpis: Array<Parameters<typeof KpiCard>[0]> = [
    { title: "Vendas do mês", value: monthSales, sub: `${monthPkgs.length} reservas criadas`, icon: Ticket, accent: "primary", spark: series.sales, deltaPct: pct(monthSales, prevSales), onClick: () => navigate("/pacotes") },
    { title: "Receita confirmada", value: fmtCurrency(monthRevenue), sub: `${monthConfirmed.length} confirmadas`, icon: DollarSign, accent: "success", spark: series.revenue, deltaPct: pct(monthRevenue, prevRevenue), onClick: () => navigate("/financeiro") },
    { title: "Margem", value: `${margin.toFixed(1)}%`, sub: `Comissão ${fmtCurrency(monthCommission)}`, icon: TrendingUp, accent: "primary", spark: series.revenue.map((v) => v * 0.1), trend: margin > 8 ? "up" : "neutral" },
    { title: "Tickets emitidos", value: ticketsIssued, sub: "Voos no mês corrente", icon: Plane, accent: "info", spark: series.tickets, deltaPct: pct(ticketsIssued, prevTickets), onClick: () => navigate("/voos") },
    { title: "Embarques próximos", value: upcomingDepartures.length, sub: "Próximos 7 dias", icon: CalendarClock, accent: "gold", spark: series.departures, trend: upcomingDepartures.length > 0 ? "alert" : "neutral", onClick: () => navigate("/pacotes") },
    { title: "Pendências financeiras", value: fmtCurrency(pendingTotal), sub: `${pendingPayments.length} reserva(s)`, icon: CreditCard, accent: "warning", spark: series.pending, trend: pendingPayments.length > 0 ? "alert" : "neutral", onClick: () => navigate("/financeiro") },
    { title: "Leads novos", value: newLeads, sub: "Captados este mês", icon: UserPlus, accent: "info", spark: series.leads, deltaPct: pct(newLeads, prevLeads), onClick: () => navigate("/clientes") },
    { title: "Conversão", value: `${conversion.toFixed(0)}%`, sub: `${soldClients}/${totalLeads} clientes`, icon: Target, accent: "success", spark: series.sales, trend: conversion > 30 ? "up" : "neutral" },
    { title: "Ticket médio", value: fmtCurrency(avgTicket), sub: `${monthConfirmed.length} reserva(s) confirmada(s)`, icon: Trophy, accent: "gold", spark: series.revenue, onClick: () => navigate("/pacotes") },
  ];

  return (
    <div className="space-y-7 relative">
      {/* Premium ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.03]" />
        <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[24rem] w-[24rem] rounded-full bg-[hsl(var(--gold))]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[20rem] w-[20rem] rounded-full bg-[hsl(var(--primary-soft))]/5 blur-[100px]" />
      </div>

      {/* Premium hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy via-[hsl(var(--navy-hover))] to-[hsl(var(--primary))] p-7 text-navy-foreground shadow-[0_20px_60px_-20px_hsl(var(--navy)/0.5)]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[hsl(var(--gold))]/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[hsl(var(--primary-soft))]/30 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] border border-white/15">
              <Sparkles className="h-3 w-3 text-[hsl(var(--gold))]" /> Command Center
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              Bom dia, <span className="bg-gradient-to-r from-[hsl(var(--gold))] via-white to-[hsl(var(--primary-soft))] bg-clip-text text-transparent">Agente</span> ✈️
            </h1>
            <p className="mt-2 text-sm text-navy-foreground/80 max-w-md">
              Tudo que importa na sua agência, em uma tela elegante e premium.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <p className="text-xs text-navy-foreground/70 tabular-nums hidden sm:block">
              {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-navy-foreground border border-white/20 backdrop-blur gap-1.5"
                onClick={() => navigate("/clientes")}>
                <UserPlus className="h-4 w-4" /> Novo cliente
              </Button>
              <Button size="sm" className="bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(var(--gold-foreground))] gap-1.5 shadow-lg shadow-[hsl(var(--gold))]/25"
                onClick={() => navigate("/cotacoes")}>
                <Plus className="h-4 w-4" /> Nova cotação
              </Button>
            </div>
          </div>
        </div>

        {/* Mini stats inline */}
        <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Receita do mês", value: fmtCurrency(monthRevenue), icon: DollarSign, color: "text-[hsl(var(--gold))]" },
            { label: "Vendas", value: monthSales, icon: Ticket, color: "text-[hsl(var(--primary-soft))]" },
            { label: "Clientes ativos", value: soldClients, icon: Users, color: "text-success" },
            { label: "Conversão", value: `${conversion.toFixed(0)}%`, icon: Target, color: "text-[hsl(var(--gold))]" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-md p-3 hover:bg-white/[0.12] transition-colors">
              <div className="flex items-center gap-2">
                <s.icon className={cn("h-4 w-4", s.color)} />
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-navy-foreground/70">{s.label}</p>
              </div>
              <p className="mt-1.5 text-2xl font-black tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-[hsl(var(--gold))]" />
          <h2 className="text-[13px] font-bold tracking-tight text-navy uppercase">Ações Rápidas</h2>
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Nova cotação", icon: FileText, to: "/cotacoes", grad: "from-primary to-[hsl(var(--primary-soft))]" },
            { label: "Novo cliente", icon: UserPlus, to: "/clientes", grad: "from-success to-[hsl(161_70%_50%)]" },
            { label: "Nova reserva", icon: Plane, to: "/pacotes", grad: "from-[hsl(var(--gold))] to-[hsl(41_100%_60%)]" },
            { label: "Lançar receita", icon: DollarSign, to: "/financeiro?tab=income", grad: "from-success to-primary" },
            { label: "Lançar despesa", icon: CreditCard, to: "/financeiro?tab=expense", grad: "from-destructive to-warning" },
            { label: "Pipeline", icon: Activity, to: "/pipeline", grad: "from-navy to-primary" },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => navigate(a.to)}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-4 text-left text-white",
                "bg-gradient-to-br shadow-lg transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.02]",
                a.grad,
              )}
            >
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/15 blur-2xl group-hover:bg-white/25 transition-colors" />
              <div className="relative">
                <div className="rounded-xl bg-white/20 backdrop-blur p-2 inline-flex">
                  <a.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <p className="mt-3 text-sm font-bold leading-tight">{a.label}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 1) AÇÃO HOJE — Central de comando operacional (TOPO, full width) */}
      {(() => {
        const totalPending = toRespondToday.length + expiringQuotes.length + overduePayments.length + trips48h.length;
        return (
          <section className="relative">
            {/* Faixa de header destacada */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-destructive/30 bg-gradient-to-r from-destructive/[0.08] via-warning/[0.06] to-[hsl(var(--gold))]/[0.08] p-5 mb-4">
              <div className="absolute -top-16 -left-10 h-40 w-40 rounded-full bg-destructive/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-[hsl(var(--gold))]/15 blur-3xl pointer-events-none" />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-destructive text-white p-2.5 shadow-lg shadow-destructive/30">
                    <Siren className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-navy uppercase leading-none">
                      Ação hoje
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Resolva o que está em risco antes de qualquer outra coisa
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider border-2",
                    totalPending > 0
                      ? "bg-destructive text-white border-destructive animate-pulse"
                      : "bg-success/15 text-success border-success/30",
                  )}>
                    {totalPending > 0 ? (
                      <>
                        <Siren className="h-3 w-3" />
                        {totalPending} pendência{totalPending !== 1 ? "s" : ""}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Tudo em dia
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de 4 cards grandes */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              <ActionCard tone="info" icon={MessageCircle} label="Sem resposta"
                count={toRespondToday.length}
                primary={`${toRespondToday.length} cliente${toRespondToday.length !== 1 ? "s" : ""}`}
                secondary={toRespondToday[0] ? `Próximo: ${toRespondToday[0].name}` : "Caixa limpa"}
                actionLabel="Responder agora" onAction={() => navigate("/clientes")}
                urgent={toRespondToday.length >= 5} />
              <ActionCard tone="warning" icon={Hourglass} label="Propostas vencendo"
                count={expiringQuotes.length}
                primary={`Em até 7 dias`}
                secondary={expiringQuotes[0] ? `${expiringQuotes[0].clientName} · ${fmtCurrency(expiringQuotes[0].value)}` : "Nada vencendo"}
                actionLabel="Renegociar" onAction={() => navigate("/cotacoes")}
                urgent={expiringQuotes.length > 0} />
              <ActionCard tone="destructive" icon={CreditCard} label="Pagamentos atrasados"
                count={overduePayments.length}
                primary={fmtCurrency(overdueTotal)}
                secondary={overduePayments[0] ? `${overduePayments[0].clientName} · ${overduePayments[0].destinationCity}` : "Carteira em dia"}
                actionLabel="Cobrar agora" onAction={() => navigate("/financeiro")}
                urgent={overduePayments.length > 0} />
              <ActionCard tone="gold" icon={Plane} label="Embarques em 48h"
                count={trips48h.length}
                primary={`Próximas 48 horas`}
                secondary={trips48h[0] ? `${trips48h[0].clientName} → ${trips48h[0].destinationCity}` : "Sem embarques"}
                actionLabel="Emitir docs" onAction={() => navigate("/pacotes")}
                urgent={trips48h.length > 0} />
            </div>
          </section>
        );
      })()}

      {/* Agenda da Agência */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-bold tracking-tight text-navy uppercase">Agenda da Agência</h2>
            <Badge variant="outline" className="text-[10px]">Próximos 7 dias</Badge>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
          {/* Aniversariantes */}
          <PanelCard title="Aniversariantes" icon={Sparkles}>
            {birthdaysSoon.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Nenhum nos próximos 7 dias</p>
            ) : (
              <ul className="space-y-2">
                {birthdaysSoon.map(({ client, date, days }) => (
                  <li key={client.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{client.name}</p>
                      <p className="text-[10.5px] text-muted-foreground tabular-nums">{fmtDate(date)} · {days === 0 ? "hoje" : `em ${days}d`}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => navigate(`/clientes/${client.id}`)}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>

          {/* Contas a pagar */}
          <PanelCard title="Contas a pagar" icon={CreditCard}>
            {payablesDue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Sem vencimentos próximos</p>
            ) : (
              <ul className="space-y-2">
                {payablesDue.map((t) => {
                  const overdue = t.date < todayStr;
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{t.description}</p>
                        <p className="text-[10.5px] text-muted-foreground tabular-nums">{fmtDate(t.date)} {overdue && <span className="text-destructive font-bold">· atrasado</span>}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] font-bold tabular-nums text-destructive">{fmtCurrency(t.value)}</span>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => navigate(`/financeiro?tab=expense${t.packageId ? `&packageId=${t.packageId}` : ""}`)}>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </PanelCard>

          {/* Voos confirmados */}
          <PanelCard title="Voos próximos" icon={Plane}>
            {flightsSoon.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Nenhum voo nos próximos 7 dias</p>
            ) : (
              <ul className="space-y-2">
                {flightsSoon.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{f.clientName} · {f.flightNumber}</p>
                      <p className="text-[10.5px] text-muted-foreground tabular-nums">{fmtDate(f.departureDate)} {f.departureTime} · {f.origin}→{f.destination}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => navigate("/voos")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>

          {/* Contas a receber */}
          <PanelCard title="Contas a receber" icon={DollarSign}>
            {receivablesDue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Sem recebimentos próximos</p>
            ) : (
              <ul className="space-y-2">
                {receivablesDue.map((t) => {
                  const overdue = t.date < todayStr;
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{t.clientName || t.description}</p>
                        <p className="text-[10.5px] text-muted-foreground tabular-nums">{fmtDate(t.date)} {overdue && <span className="text-destructive font-bold">· atrasado</span>}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] font-bold tabular-nums text-success">{fmtCurrency(t.value)}</span>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => navigate(`/financeiro?tab=income${t.packageId ? `&packageId=${t.packageId}` : t.clientId ? `&clientId=${t.clientId}` : ""}`)}>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </PanelCard>

          {/* Viagens próximas */}
          <PanelCard title="Viagens próximas" icon={CalendarClock}>
            {tripsSoon.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Nenhuma viagem nos próximos 7 dias</p>
            ) : (
              <ul className="space-y-2">
                {tripsSoon.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{p.destinationFlag ?? "🌍"} {p.clientName}</p>
                      <p className="text-[10.5px] text-muted-foreground tabular-nums">{fmtDate(p.departureDate)} · {p.destinationCity}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => navigate(`/pacotes/${p.id}`)}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>
        </div>
      </section>

      {/* 2) KPIs — contexto secundário */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">Visão geral do mês</h2>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">Performance e indicadores de longo prazo</p>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
          {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
        </div>
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

        {/* Follow-up comercial */}
        <PanelCard title="Follow-up comercial" icon={PhoneCall} className="lg:col-span-6"
          action={<Badge variant="warning">{followUpsRich.length} leads</Badge>}
        >
          <div className="space-y-2">
            {followUpsRich.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Sem follow-ups pendentes 🎉</p>}
            {followUpsRich.map(({ client: c, daysSilent, potential }) => {
              const heat = daysSilent >= 7 ? "destructive" : daysSilent >= 3 ? "warning" : "info";
              const heatStyle =
                heat === "destructive" ? "bg-destructive/10 text-destructive border-destructive/30" :
                heat === "warning" ? "bg-warning/10 text-warning border-warning/30" :
                "bg-info-soft text-info-soft-foreground border-info/30";
              return (
                <div key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-soft))] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-2">
                      {c.name}
                      <StatusBadge variant={c.status} />
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", heatStyle)}>
                        <Clock className="h-2.5 w-2.5" />
                        {daysSilent === 0 ? "hoje" : `${daysSilent}d sem resposta`}
                      </span>
                      {potential > 0 && (
                        <span className="tabular-nums text-navy font-semibold">{fmtCurrency(potential)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
                      onClick={() => navigate(`/clientes/${c.id}`)} title="Abrir lead">
                      <ExternalLink className="h-3 w-3" /> Abrir
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-success"
                      title="Enviar mensagem"
                      onClick={() => {
                        const phone = c.phone.replace(/\D/g, "");
                        const msg = `Olá ${c.name.split(" ")[0]}, tudo bem? Estou retomando nossa conversa sobre sua próxima viagem. Posso te ajudar?`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                        toast({ title: "Mensagem aberta", description: `WhatsApp pré-preenchido para ${c.name}.` });
                      }}>
                      <MessageSquare className="h-3 w-3" /> Mensagem
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>

        {/* Viagens próximas — com status operacional */}
        <PanelCard title="Viagens próximas" icon={Plane} className="lg:col-span-7"
          action={<Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/pacotes")}>Todas <ChevronRight className="h-3 w-3" /></Button>}
        >
          <div className="space-y-2">
            {nearTripsRich.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhum embarque agendado.</p>}
            {nearTripsRich.map(({ pkg: p, days, checkinReady, voucherReady, docsReady }) => {
              const urgent = days <= 2;
              const warn = days <= 7 && days > 2;
              return (
                <div key={p.id}
                  className={cn(
                    "rounded-lg border p-2.5 transition-colors",
                    urgent ? "border-destructive/40 bg-destructive/5" :
                    warn ? "border-warning/30 bg-warning/[0.04]" :
                    "border-border/60 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl shrink-0" aria-hidden>{p.destinationFlag ?? "🌍"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.clientName}</p>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{p.destinationCity}, {p.destinationCountry}
                      </p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold",
                          checkinReady ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                        )} title="Check-in">
                          <Plane className="h-2.5 w-2.5" /> check-in
                        </span>
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold",
                          voucherReady ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                        )} title="Voucher">
                          <FileCheck className="h-2.5 w-2.5" /> voucher
                        </span>
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold",
                          docsReady ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                        )} title="Documentos">
                          <ShieldCheck className="h-2.5 w-2.5" /> docs
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-navy">{fmtDate(p.departureDate)}</p>
                      <p className={cn(
                        "text-[10.5px] font-semibold tabular-nums",
                        urgent ? "text-destructive" : warn ? "text-warning" : "text-muted-foreground",
                      )}>
                        {days <= 0 ? "hoje" : `em ${days} dia${days !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  {/* Ações funcionais */}
                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-border/40">
                    <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] gap-1 justify-center"
                      onClick={() => navigate(`/pacotes/${p.id}`)}>
                      <ExternalLink className="h-3 w-3" /> Ver reserva
                    </Button>
                    <Button size="sm" variant="ghost"
                      className={cn(
                        "flex-1 h-7 text-[11px] gap-1 justify-center",
                        voucherReady ? "text-success" : "text-warning",
                      )}
                      onClick={() => {
                        toast({
                          title: voucherReady ? "Voucher pronto" : "Voucher solicitado",
                          description: voucherReady
                            ? `Voucher de ${p.clientName} disponível para ${p.destinationCity}.`
                            : `Geração de voucher para ${p.clientName} adicionada à fila.`,
                        });
                      }}>
                      <FileCheck className="h-3 w-3" /> {voucherReady ? "Ver voucher" : "Gerar voucher"}
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] gap-1 justify-center"
                      onClick={() => navigate(`/clientes/${p.clientId}`)}>
                      <Users className="h-3 w-3" /> Cliente
                    </Button>
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

      {/* Tendência + Top Clientes */}
      <section className="grid gap-5 lg:grid-cols-12">
        <PanelCard title="Tendência de vendas (6 meses)" icon={TrendingUp} className="lg:col-span-7">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--gold))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={42} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number, name: string) => name === "Receita" ? [fmtCurrency(value), name] : [value, name]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Line yAxisId="left" type="monotone" dataKey="Vendas" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }} activeDot={{ r: 6 }} animationDuration={900} />
                <Line yAxisId="right" type="monotone" dataKey="Receita" stroke="hsl(var(--gold))" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }} activeDot={{ r: 6 }} animationDuration={1100} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Top clientes mais valiosos" icon={Trophy} className="lg:col-span-5"
          action={<Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/clientes")}>Todos <ChevronRight className="h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            {topClients.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Sem vendas registradas ainda.</p>}
            {topClients.map((c, i) => {
              const medal = ["from-[hsl(var(--gold))] to-[hsl(41_100%_60%)]", "from-[hsl(0_0%_70%)] to-[hsl(0_0%_85%)]", "from-[hsl(25_60%_50%)] to-[hsl(25_70%_65%)]"][i] || "from-primary to-[hsl(var(--primary-soft))]";
              return (
                <button key={c.id} onClick={() => navigate(`/clientes/${c.id}`)}
                  className="group w-full text-left rounded-xl border border-border/60 p-3 hover:border-primary/40 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-full bg-gradient-to-br shadow flex items-center justify-center text-white font-black text-sm shrink-0", medal)}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-navy">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {c.trips} viagem{c.trips !== 1 ? "s" : ""}{c.lastTrip ? ` · última ${fmtDate(c.lastTrip)}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold tabular-nums text-navy">{fmtCurrency(c.revenue)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Receita</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary via-[hsl(var(--primary-soft))] to-[hsl(var(--gold))] transition-all duration-700"
                      style={{ width: `${(c.revenue / topClientsMax) * 100}%` }} />
                  </div>
                </button>
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
                <Bar dataKey="Receitas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} animationDuration={900} />
                <Bar dataKey="Despesas" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} animationDuration={1100} />
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
                  <Pie data={categoryStats} dataKey="value" nameKey="name" cx="40%" cy="50%" innerRadius={32} outerRadius={62} paddingAngle={2} animationDuration={900}>
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

        {/* IA Concierge — painel inteligente em 4 cards */}
        <PanelCard
          title="IA Concierge"
          icon={Sparkles}
          className="lg:col-span-12"
          action={<Badge variant="outline" className="border-[hsl(var(--gold))]/40 text-[hsl(var(--gold))] bg-[hsl(var(--gold))]/5 text-[10.5px]">
            <Sparkles className="h-3 w-3 mr-1" /> insights ao vivo
          </Badge>}
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-navy via-[hsl(var(--navy-hover))] to-[hsl(var(--navy-active))] text-navy-foreground p-5 overflow-hidden">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[hsl(var(--primary-soft))]/25 blur-3xl" aria-hidden />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[hsl(var(--gold))]/15 blur-3xl" aria-hidden />

            {/* Headline contextual — síntese acionável */}
            <div className="relative mb-4 flex flex-wrap gap-2">
              {hotClients.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/20 border border-destructive/30 text-navy-foreground px-3 py-1 text-[11.5px] font-semibold">
                  <Flame className="h-3 w-3 text-destructive" />
                  {hotClients.length} {hotClients.length === 1 ? "cliente pode" : "clientes podem"} fechar hoje
                </span>
              )}
              {finAlerts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/20 border border-warning/30 text-navy-foreground px-3 py-1 text-[11.5px] font-semibold">
                  <CreditCard className="h-3 w-3 text-warning" />
                  {finAlerts.length} pagamento{finAlerts.length !== 1 ? "s" : ""} atrasado{finAlerts.length !== 1 ? "s" : ""}
                </span>
              )}
              {urgentTrips.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--gold))]/25 border border-[hsl(var(--gold))]/30 text-navy-foreground px-3 py-1 text-[11.5px] font-semibold">
                  <Plane className="h-3 w-3 text-[hsl(var(--gold))]" />
                  {urgentTrips.length} viagem{urgentTrips.length !== 1 ? "ns" : ""} precisa{urgentTrips.length !== 1 ? "m" : ""} emissão urgente
                </span>
              )}
              {hotClients.length === 0 && finAlerts.length === 0 && urgentTrips.length === 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/20 border border-success/30 text-navy-foreground px-3 py-1 text-[11.5px] font-semibold">
                  <CheckCircle2 className="h-3 w-3 text-success" /> Tudo sob controle
                </span>
              )}
            </div>

            <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {/* Clientes quentes */}
              <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4 backdrop-blur-md hover:bg-white/[0.10] transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-destructive/20 text-destructive p-1.5"><Flame className="h-3.5 w-3.5" /></div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy-foreground/80">Clientes quentes</p>
                  <Badge variant="secondary" className="ml-auto bg-white/15 text-navy-foreground border-0 text-[10px]">{hotClients.length}</Badge>
                </div>
                {hotClients.length === 0 ? (
                  <p className="text-[11.5px] text-navy-foreground/60">Nenhum lead em ebulição agora.</p>
                ) : (
                  <ul className="space-y-2">
                    {hotClients.map(({ client, lastQuote }) => {
                      const phone = client.phone.replace(/\D/g, "");
                      const msg = lastQuote
                        ? `Olá ${client.name.split(" ")[0]}, tudo bem? Passando para saber se já conseguiu avaliar a proposta para ${lastQuote.destination}. Posso esclarecer alguma dúvida?`
                        : `Olá ${client.name.split(" ")[0]}, tudo bem? Tenho novidades para sua próxima viagem. Quando podemos conversar?`;
                      return (
                        <li key={client.id} className="rounded-lg bg-white/5 border border-white/10 p-2">
                          <div className="flex items-center gap-2 text-[12px] mb-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0 animate-pulse" />
                            <span className="truncate flex-1 font-medium">{client.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank")}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-success/20 hover:bg-success/30 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                              title="Gerar mensagem WhatsApp"
                            >
                              <MessageSquare className="h-3 w-3" /> Mensagem
                            </button>
                            <button
                              onClick={() => navigate(`/cotacoes`)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[hsl(var(--gold))]/25 hover:bg-[hsl(var(--gold))]/35 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                              title="Criar tarefa / nova cotação"
                            >
                              <ListTodo className="h-3 w-3" /> Tarefa
                            </button>
                            <button
                              onClick={() => navigate(`/clientes/${client.id}`)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                              title="Abrir ficha do cliente"
                            >
                              <ExternalLink className="h-3 w-3" /> Abrir
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Viagens urgentes */}
              <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4 backdrop-blur-md hover:bg-white/[0.10] transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-warning/25 text-warning p-1.5"><Zap className="h-3.5 w-3.5" /></div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy-foreground/80">Viagens urgentes</p>
                  <Badge variant="secondary" className="ml-auto bg-white/15 text-navy-foreground border-0 text-[10px]">{urgentTrips.length}</Badge>
                </div>
                {urgentTrips.length === 0 ? (
                  <p className="text-[11.5px] text-navy-foreground/60">Nenhum embarque imediato.</p>
                ) : (
                  <ul className="space-y-2">
                    {urgentTrips.map((p) => {
                      const days = Math.max(0, Math.ceil((new Date(p.departureDate).getTime() - now.getTime()) / 86400000));
                      return (
                        <li key={p.id} className="rounded-lg bg-white/5 border border-white/10 p-2">
                          <div className="flex items-center gap-2 text-[12px] mb-1.5">
                            <span className="shrink-0">{p.destinationFlag ?? "🌍"}</span>
                            <span className="truncate flex-1 font-medium">{p.clientName}</span>
                            <span className="text-[10px] font-bold tabular-nums text-warning shrink-0">{days}d</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                toast({ title: "Emissão solicitada", description: `Emissão de docs para ${p.clientName} adicionada à fila.` });
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-warning/25 hover:bg-warning/35 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                              title="Solicitar emissão de docs">
                              <Zap className="h-3 w-3" /> Emitir
                            </button>
                            <button
                              onClick={() => navigate(`/pacotes/${p.id}`)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                              title="Abrir reserva">
                              <ExternalLink className="h-3 w-3" /> Abrir
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Oportunidades de upsell */}
              <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4 backdrop-blur-md hover:bg-white/[0.10] transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-[hsl(var(--gold))]/25 text-[hsl(var(--gold))] p-1.5"><TrendingUp className="h-3.5 w-3.5" /></div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy-foreground/80">Upsell</p>
                  <Badge variant="secondary" className="ml-auto bg-white/15 text-navy-foreground border-0 text-[10px]">{upsellTargets.length}</Badge>
                </div>
                {upsellTargets.length === 0 ? (
                  <p className="text-[11.5px] text-navy-foreground/60">Carteira ativa toda engajada.</p>
                ) : (
                  <ul className="space-y-2">
                    {upsellTargets.map((c) => (
                      <li key={c.id} className="rounded-lg bg-white/5 border border-white/10 p-2">
                        <div className="flex items-center gap-2 text-[12px] mb-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))] shrink-0" />
                          <span className="truncate flex-1 font-medium">{c.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              navigate("/cotacoes");
                              toast({ title: "Cotação sugerida", description: `Crie uma proposta de upsell para ${c.name}.` });
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[hsl(var(--gold))]/25 hover:bg-[hsl(var(--gold))]/35 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                            title="Criar cotação de upsell">
                            <FileText className="h-3 w-3" /> Cotar
                          </button>
                          <button
                            onClick={() => navigate(`/clientes/${c.id}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                            title="Abrir cliente">
                            <ExternalLink className="h-3 w-3" /> Abrir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Alertas financeiros */}
              <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4 backdrop-blur-md hover:bg-white/[0.10] transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-lg bg-destructive/20 text-destructive p-1.5"><CreditCard className="h-3.5 w-3.5" /></div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy-foreground/80">Alertas financeiros</p>
                  <Badge variant="secondary" className="ml-auto bg-white/15 text-navy-foreground border-0 text-[10px]">{finAlerts.length}</Badge>
                </div>
                {finAlerts.length === 0 ? (
                  <p className="text-[11.5px] text-navy-foreground/60">Carteira em dia 👌</p>
                ) : (
                  <ul className="space-y-2">
                    {finAlerts.map((p) => (
                      <li key={p.id} className="rounded-lg bg-white/5 border border-white/10 p-2">
                        <div className="flex items-center gap-2 text-[12px] mb-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0 animate-pulse" />
                          <span className="truncate flex-1 font-medium">{p.clientName}</span>
                          <span className="text-[10.5px] text-navy-foreground/80 tabular-nums shrink-0 font-bold">{fmtCurrency(p.totalValue)}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const phone = (clients.find((c) => c.id === p.clientId)?.phone || "").replace(/\D/g, "");
                              const msg = `Olá ${p.clientName.split(" ")[0]}, tudo bem? Passando para confirmar o pagamento de ${fmtCurrency(p.totalValue)} referente à viagem para ${p.destinationCity}. Pode confirmar?`;
                              if (phone) {
                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                                toast({ title: "Cobrança enviada", description: `Mensagem WhatsApp aberta para ${p.clientName}.` });
                              } else {
                                toast({ title: "Telefone não encontrado", description: "Cadastre o telefone do cliente.", variant: "destructive" });
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-destructive/25 hover:bg-destructive/35 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                            title="Enviar cobrança">
                            <CreditCard className="h-3 w-3" /> Cobrar
                          </button>
                          <button
                            onClick={() => navigate(`/pacotes/${p.id}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-white/10 hover:bg-white/20 text-navy-foreground text-[10px] font-semibold py-1 transition-colors"
                            title="Abrir reserva">
                            <ExternalLink className="h-3 w-3" /> Abrir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary"
                className="gap-1.5 bg-white/10 hover:bg-white/20 text-navy-foreground border-white/20"
                onClick={() => navigate("/cotacoes")}>
                <FileText className="h-3.5 w-3.5" /> Sugerir nova cotação
              </Button>
              <Button size="sm" variant="secondary"
                className="gap-1.5 bg-white/10 hover:bg-white/20 text-navy-foreground border-white/20"
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

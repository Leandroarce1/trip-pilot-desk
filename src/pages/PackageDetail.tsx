import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Plane, DollarSign, Calendar, FileText, User, Clock,
  CheckCircle2, Edit2, Users, ShieldCheck, Hash, Sparkles, Wallet,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationStatus, TripType } from "@/types/crm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SalesJourney } from "@/components/SalesJourney";
import { NextStepBanner } from "@/components/NextStepBanner";

const reservationStatusLabels: Record<ReservationStatus, string> = {
  quoting: "Em cotação",
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const reservationStatusBadge: Record<ReservationStatus, string> = {
  quoting: "bg-info-soft text-info-soft-foreground",
  pending: "bg-warning-soft text-warning-soft-foreground",
  confirmed: "bg-success-soft text-success-soft-foreground",
  cancelled: "bg-error-soft text-error-soft-foreground",
};

const tripTypeLabels: Record<TripType, string> = {
  air: "Aéreo",
  package: "Pacote completo",
  cruise: "Cruzeiro",
  road: "Rodoviário",
  hotel: "Hotel",
};

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const fmtDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const docExpiryStatus = (expiresAt?: string) => {
  if (!expiresAt) return { label: "—", tone: "muted" as const };
  const now = new Date();
  const exp = new Date(expiresAt);
  const days = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Vencido", tone: "danger" as const };
  if (days < 60) return { label: `Vence em ${days}d`, tone: "warning" as const };
  return { label: `Válido até ${fmtDate(expiresAt)}`, tone: "ok" as const };
};

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { packages, quotes, flights, transactions, itineraries, updatePackage, addTransaction } = useData();
  const pkg = packages.find((p) => p.id === id);
  const [editingPassengers] = useState(false);

  if (!pkg) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/pacotes")}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <p className="text-muted-foreground">Reserva não encontrada.</p>
      </div>
    );
  }

  const quote = quotes.find((q) => q.id === pkg.quoteId);
  const pkgFlights = flights.filter((f) => f.packageId === pkg.id);
  const pkgTransactions = transactions.filter((t) => t.packageId === pkg.id);
  const totalValue = pkg.totalValue;
  const totalPaid = pkgTransactions
    .filter((t) => t.status === "paid" && t.type === "income")
    .reduce((s, t) => s + t.value, 0);
  const commission = (pkg.totalValue * pkg.commissionPercent) / 100;

  const handleConfirm = () => {
    if (pkg.reservationStatus === "confirmed") {
      toast.info("Reserva já está confirmada");
      return;
    }
    updatePackage({
      ...pkg,
      reservationStatus: "confirmed",
      history: [
        ...pkg.history,
        { date: new Date().toISOString(), action: "Status alterado para Confirmada" },
      ],
    });
    toast.success("Reserva confirmada");
  };

  /** Gera lançamento financeiro (income pendente) vinculado à reserva */
  const generateFinancial = () => {
    const filterQuery = `?packageId=${pkg.id}&tab=receivables`;
    if (pkgTransactions.length > 0) {
      toast.info("Financeiro já gerado", { description: "Abrindo lançamentos vinculados a esta reserva." });
      navigate(`/financeiro${filterQuery}`);
      return;
    }
    addTransaction({
      type: "income",
      description: `Recebimento — ${pkg.destinationCity} (${pkg.clientName})`,
      value: pkg.totalValue,
      date: new Date().toISOString().slice(0, 10),
      status: "pending",
      clientName: pkg.clientName,
      clientId: pkg.clientId,
      packageId: pkg.id,
    });
    updatePackage({
      ...pkg,
      history: [
        ...pkg.history,
        { date: new Date().toISOString(), action: "Lançamento financeiro gerado" },
      ],
    });
    toast.success("Financeiro gerado", {
      description: `Recebimento de R$ ${pkg.totalValue.toLocaleString("pt-BR")} criado como pendente.`,
    });
    navigate(`/financeiro${filterQuery}`);
  };

  const hasFinancial = pkgTransactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="breadcrumb">
        <button onClick={() => navigate(`/clientes/${pkg.clientId}`)} className="hover:text-foreground transition-colors">
          {pkg.clientName || "Cliente"}
        </button>
        <span>/</span>
        {quote ? (
          <button onClick={() => navigate(`/cotacoes?id=${quote.id}`)} className="hover:text-foreground transition-colors">
            Proposta
          </button>
        ) : (
          <span className="opacity-50">Proposta</span>
        )}
        <span>/</span>
        <span className="font-semibold text-foreground">Reserva</span>
        <span>/</span>
        <button onClick={() => navigate(`/financeiro?packageId=${pkg.id}&tab=receivables`)} className="hover:text-foreground transition-colors">
          Financeiro
        </button>
      </nav>

      {/* ---------- Header ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pacotes")} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="label-caption mb-1">Reserva</p>
            <h1 className="text-2xl tracking-tight truncate">
              <span className="mr-2">{pkg.destinationFlag}</span>
              {pkg.destinationCity}
              <span className="text-muted-foreground font-normal">, {pkg.destinationCountry}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
                  reservationStatusBadge[pkg.reservationStatus],
                )}
              >
                {reservationStatusLabels[pkg.reservationStatus]}
              </span>
              <span className="text-xs text-muted-foreground">{tripTypeLabels[pkg.tripType]}</span>
              {pkg.confirmationCode && (
                <span className="inline-flex items-center gap-1 text-xs text-mono">
                  <Hash className="h-3 w-3" />
                  {pkg.confirmationCode}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pkg.reservationStatus !== "confirmed" && pkg.reservationStatus !== "cancelled" && (
            <Button onClick={handleConfirm}>
              <CheckCircle2 className="h-4 w-4" /> Marcar como confirmada
            </Button>
          )}
          <Button
            variant={hasFinancial ? "outline" : "default"}
            onClick={generateFinancial}
            className={cn(!hasFinancial && "bg-success-soft-foreground text-white hover:bg-success-soft-foreground/90")}
          >
            <Wallet className="h-4 w-4" />
            {hasFinancial ? "Ver financeiro" : "Gerar financeiro"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/pacotes")}>
            <Edit2 className="h-4 w-4" /> Editar reserva
          </Button>
        </div>
      </div>

      {/* ---------- Sales journey & próxima ação ---------- */}
      <SalesJourney current="reservation" />
      {!hasFinancial && (
        <NextStepBanner
          title="Próxima ação: gerar financeiro"
          description={`Crie o lançamento de recebimento (${fmtCurrency(pkg.totalValue)}) vinculado a esta reserva.`}
          actionLabel="Gerar financeiro agora"
          onAction={generateFinancial}
        />
      )}

      {/* ---------- Summary cards ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2"><User className="h-4 w-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="label-caption">Cliente</p>
              <p className="text-sm font-semibold text-navy truncate cursor-pointer hover:underline" onClick={() => navigate(`/clientes/${pkg.clientId}`)}>
                {pkg.clientName}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2"><Calendar className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="label-caption">Embarque → Retorno</p>
              <p className="text-sm font-semibold text-navy tabular-nums">
                {fmtDate(pkg.departureDate)} – {fmtDate(pkg.returnDate)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-success-soft p-2"><DollarSign className="h-4 w-4 text-success-soft-foreground" /></div>
            <div>
              <p className="label-caption">Pago / Total</p>
              <p className="text-sm font-semibold text-navy tabular-nums">{fmtCurrency(totalPaid)} / {fmtCurrency(totalValue)}</p>
              <p className="text-[11px] text-mono">Comissão: {fmtCurrency(commission)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2"><MapPin className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="label-caption">Fornecedor</p>
              <p className="text-sm font-semibold text-navy">{pkg.supplier || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Passengers ---------- */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Passageiros
            <span className="ml-1 text-xs text-muted-foreground font-normal">({pkg.passengers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pkg.passengers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum passageiro cadastrado</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {pkg.passengers.map((pax, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    {pax.name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{pax.name}</p>
                    {pax.document && <p className="text-[11px] text-muted-foreground font-mono">{pax.document}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {editingPassengers && null}
        </CardContent>
      </Card>

      {/* ---------- Documents ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Documentos necessários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pkg.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento registrado</p>
          ) : (
            <div className="space-y-2">
              {pkg.documents.map((doc, i) => {
                const status = docExpiryStatus(doc.expiresAt);
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{doc.label}</p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{doc.type}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
                        status.tone === "danger" && "bg-error-soft text-error-soft-foreground",
                        status.tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                        status.tone === "ok" && "bg-success-soft text-success-soft-foreground",
                        status.tone === "muted" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Itinerary (vinculado por package_id ou quote_id) ---------- */}
      {(() => {
        const linked = itineraries.find(
          (it) => it.packageId === pkg.id || (pkg.quoteId && it.quoteId === pkg.quoteId),
        );
        const hasDetailed = linked && linked.days?.length > 0;
        const hasSimple = !linked && quote?.itinerary && quote.itinerary.length > 0;

        if (!hasDetailed && !hasSimple) {
          return (
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />Itinerário
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => navigate(`/itinerarios?packageId=${pkg.id}`)}>
                  Criar itinerário
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nenhum roteiro vinculado a esta reserva.
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {linked?.title || "Itinerário"}
              </CardTitle>
              {linked && (
                <Button size="sm" variant="outline" onClick={() => navigate(`/itinerarios?edit=${linked.id}`)}>
                  Editar roteiro
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {hasDetailed
                ? linked!.days.map((day) => (
                    <div key={day.day} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {day.day}
                        </div>
                        <div className="flex-1 w-px bg-border mt-1" />
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy">
                          Dia {day.day}{day.title ? ` — ${day.title}` : ""}
                          {day.date && <span className="ml-2 text-[11px] text-muted-foreground font-normal tabular-nums">{fmtDate(day.date)}</span>}
                        </p>
                        <div className="mt-1 space-y-1 text-sm">
                          {day.periods?.morning && (
                            <p><span className="text-[11px] uppercase tracking-wide text-amber-600 font-semibold mr-1.5">Manhã</span><span className="text-muted-foreground">{day.periods.morning}</span></p>
                          )}
                          {day.periods?.afternoon && (
                            <p><span className="text-[11px] uppercase tracking-wide text-amber-600 font-semibold mr-1.5">Tarde</span><span className="text-muted-foreground">{day.periods.afternoon}</span></p>
                          )}
                          {day.periods?.evening && (
                            <p><span className="text-[11px] uppercase tracking-wide text-amber-600 font-semibold mr-1.5">Noite</span><span className="text-muted-foreground">{day.periods.evening}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : quote!.itinerary!.map((day) => (
                    <div key={day.day} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {day.day}
                        </div>
                        <div className="flex-1 w-px bg-border mt-1" />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-navy">{day.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{day.description}</p>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        );
      })()}

      {/* ---------- Flights ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />Voos</CardTitle>
        </CardHeader>
        <CardContent>
          {pkgFlights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum voo vinculado</p>
          ) : (
            <div className="space-y-2">
              {pkgFlights.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                  <div>
                    <p className="text-sm font-medium text-navy">{f.airline} · <span className="font-mono">{f.flightNumber}</span></p>
                    <p className="text-xs text-muted-foreground">{f.origin} → {f.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">{fmtDate(f.departureDate)}</p>
                    <p className="text-xs text-muted-foreground">{f.departureTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Payments ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {pkgTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pagamento vinculado</p>
          ) : (
            <div className="space-y-2">
              {pkgTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                  <div>
                    <p className="text-sm font-medium text-navy">{t.description}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{fmtDate(t.date)}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="text-sm font-semibold tabular-nums">{fmtCurrency(t.value)}</p>
                    <StatusBadge variant={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- History timeline ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Histórico de alterações</CardTitle>
        </CardHeader>
        <CardContent>
          {pkg.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem alterações registradas</p>
          ) : (
            <ol className="relative space-y-4 ml-2">
              {[...pkg.history].reverse().map((entry, i) => (
                <li key={i} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" aria-hidden />
                  <span className="absolute left-[3px] top-3 bottom-[-12px] w-px bg-border last:hidden" aria-hidden />
                  <p className="text-sm text-navy font-medium">{entry.action}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">{fmtDateTime(entry.date)}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* ---------- Notes ---------- */}
      {pkg.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Observações</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{pkg.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
};

export default PackageDetail;

import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, CheckCircle, Clock, Plane, ArrowLeft, Package as PackageIcon } from "lucide-react";
import { fmtDate } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  flight: "✈️ Aéreo", hotel: "🏨 Hotel", transfer: "🚐 Translado",
  tour: "🗺️ Passeio", insurance: "🛡️ Seguro", other: "📦 Outro",
};

const BookingPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const { quotes, flights, transactions } = useData();
  const quote = quotes.find((q) => q.id === quoteId);

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Proposta não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedFlights = flights.filter((f) => f.clientId === quote.clientId);
  const relatedPayments = transactions.filter((t) => t.clientName === quote.clientName && t.type === "income");
  const totalPaid = relatedPayments.filter((t) => t.status === "paid").reduce((s, t) => s + t.value, 0);
  const remaining = quote.value - totalPaid;
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Proposta de Viagem</p>
          <h1 className="text-2xl font-bold">{quote.destination}</h1>
          <p className="text-sm text-muted-foreground mt-1">Preparada para {quote.clientName}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Status + Value */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Calendar className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="text-sm font-semibold tabular-nums">{fmtDate(quote.startDate)} a {fmtDate(quote.endDate)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2"><DollarSign className="h-4 w-4 text-success" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Valor Total</p>
                <p className="text-sm font-bold">{fmt(quote.value)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              {quote.status === "approved" ? (
                <div className="rounded-lg bg-success/10 p-2"><CheckCircle className="h-4 w-4 text-success" /></div>
              ) : (
                <div className="rounded-lg bg-warning/10 p-2"><Clock className="h-4 w-4 text-warning" /></div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge variant={quote.status} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {quote.description && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Descrição do Pacote</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{quote.description}</p></CardContent>
          </Card>
        )}

        {/* Itinerary */}
        {quote.itinerary && quote.itinerary.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />Roteiro da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quote.itinerary.map((day) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{day.day}</div>
                    <div className="flex-1 w-px bg-border mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold">Dia {day.day} — {day.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{day.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Flights */}
        {relatedFlights.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />Voos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {relatedFlights.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{f.airline} · {f.flightNumber}</p>
                    <p className="text-xs text-muted-foreground">{f.origin} → {f.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">{fmtDate(f.departureDate)}</p>
                    <p className="text-xs text-muted-foreground">{f.departureTime}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Payment Status */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Pagamentos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor total</span>
              <span className="font-semibold">{fmt(quote.value)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pago</span>
              <span className="font-semibold text-success">{fmt(totalPaid)}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Restante</span>
                <span className="font-semibold text-warning">{fmt(remaining)}</span>
              </div>
            )}
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-success h-2 rounded-full transition-all" style={{ width: `${Math.min((totalPaid / quote.value) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pt-4">TravelCRM · Proposta gerada automaticamente</p>
      </div>
    </div>
  );
};

export default BookingPage;

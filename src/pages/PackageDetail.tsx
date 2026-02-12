import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Plane, DollarSign, Calendar, FileText, User, Clock } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  planning: "Planejamento",
  confirmed: "Confirmado",
  traveling: "Em viagem",
  completed: "Concluído",
};

const statusColors: Record<string, string> = {
  planning: "bg-info/15 text-info",
  confirmed: "bg-success/15 text-success",
  traveling: "bg-warning/15 text-warning",
  completed: "bg-muted text-muted-foreground",
};

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { packages, quotes, flights, transactions, clients } = useData();
  const pkg = packages.find((p) => p.id === id);

  if (!pkg) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/pacotes")}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <p className="text-muted-foreground">Pacote não encontrado.</p>
      </div>
    );
  }

  const quote = quotes.find((q) => q.id === pkg.quoteId);
  const pkgFlights = flights.filter((f) => pkg.flightIds.includes(f.id));
  const pkgTransactions = transactions.filter((t) => pkg.transactionIds.includes(t.id));
  const totalValue = quote?.value || 0;
  const totalPaid = pkgTransactions.filter((t) => t.status === "paid" && t.type === "income").reduce((s, t) => s + t.value, 0);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/pacotes")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{pkg.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusColors[pkg.status])}>
              {statusLabels[pkg.status]}
            </span>
            <span className="text-xs text-muted-foreground">Criado em {pkg.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><User className="h-4 w-4 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Cliente</p><p className="text-sm font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/clientes/${pkg.clientId}`)}>{pkg.clientName}</p></div>
          </CardContent>
        </Card>
        {quote && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><MapPin className="h-4 w-4 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">Destino</p><p className="text-sm font-semibold">{quote.destination}</p></div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2"><DollarSign className="h-4 w-4 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Pago / Total</p><p className="text-sm font-semibold">{fmt(totalPaid)} / {fmt(totalValue)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-info/10 p-2"><Plane className="h-4 w-4 text-info" /></div>
            <div><p className="text-xs text-muted-foreground">Voos</p><p className="text-sm font-semibold">{pkgFlights.length} registrado(s)</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Itinerary */}
      {quote?.itinerary && quote.itinerary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Itinerário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.itinerary.map((day) => (
              <div key={day.day} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{day.day}</div>
                  <div className="flex-1 w-px bg-border mt-1" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold">{day.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{day.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Flights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />Voos</CardTitle>
        </CardHeader>
        <CardContent>
          {pkgFlights.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum voo vinculado</p> : (
            <div className="space-y-2">
              {pkgFlights.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{f.airline} · {f.flightNumber}</p>
                    <p className="text-xs text-muted-foreground">{f.origin} → {f.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{f.departureDate}</p>
                    <p className="text-xs text-muted-foreground">{f.departureTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {pkgTransactions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum pagamento vinculado</p> : (
            <div className="space-y-2">
              {pkgTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="text-sm font-semibold">{fmt(t.value)}</p>
                    <StatusBadge variant={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pkg.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Observações</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{pkg.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
};

export default PackageDetail;

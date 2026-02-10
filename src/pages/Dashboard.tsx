import { Plane, Users, FileText, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { mockClients, mockFlights, mockQuotes, mockTransactions } from "@/data/mockData";

function getCheckinAlerts() {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return mockFlights.filter((f) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime}`);
    return dep >= now && dep <= in48h;
  });
}

const Dashboard = () => {
  const checkinAlerts = getCheckinAlerts();
  const upcomingFlights = mockFlights
    .filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) >= new Date())
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
    .slice(0, 5);

  const pendingPayments = mockTransactions.filter((t) => t.status === "pending");
  const monthIncome = mockTransactions.filter((t) => t.type === "income" && t.date.startsWith("2026-02")).reduce((s, t) => s + t.value, 0);
  const monthExpense = mockTransactions.filter((t) => t.type === "expense" && t.date.startsWith("2026-02")).reduce((s, t) => s + t.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua agência</p>
      </div>

      {/* Alerts */}
      {checkinAlerts.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Alertas de Check-in (próximas 48h)</h3>
          </div>
          <div className="space-y-2">
            {checkinAlerts.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg bg-card p-3 text-sm">
                <div className="flex items-center gap-3">
                  <Plane className="h-4 w-4 text-warning" />
                  <span className="font-medium">{f.clientName}</span>
                  <span className="text-muted-foreground">{f.flightNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{f.origin} → {f.destination}</span>
                  <span className="font-medium text-foreground">{f.departureDate} {f.departureTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Clientes" value={mockClients.length} icon={Users} description="Total cadastrados" />
        <StatCard title="Cotações Ativas" value={mockQuotes.filter((q) => q.status === "sent").length} icon={FileText} variant="info" description="Aguardando resposta" />
        <StatCard title="Receita do Mês" value={`R$ ${monthIncome.toLocaleString("pt-BR")}`} icon={DollarSign} variant="success" description={`Despesas: R$ ${monthExpense.toLocaleString("pt-BR")}`} />
        <StatCard title="Pagamentos Pendentes" value={pendingPayments.length} icon={Clock} variant="warning" description={`R$ ${pendingPayments.reduce((s, t) => s + t.value, 0).toLocaleString("pt-BR")}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming flights */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Próximos Voos</h3>
          {upcomingFlights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum voo programado</p>
          ) : (
            <div className="space-y-3">
              {upcomingFlights.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{f.clientName}</p>
                    <p className="text-xs text-muted-foreground">{f.airline} • {f.flightNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{f.origin} → {f.destination}</p>
                    <p className="text-xs text-muted-foreground">{f.departureDate} às {f.departureTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending payments */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Pagamentos Pendentes</h3>
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pagamento pendente</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-warning">R$ {t.value.toLocaleString("pt-BR")}</p>
                    <StatusBadge variant="pending" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

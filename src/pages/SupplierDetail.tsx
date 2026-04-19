import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, Globe, Phone, Mail, Star, DollarSign, Calendar, FileText,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import {
  supplierCategoryLabels, supplierCategoryBadge, paymentTermLabels,
} from "@/lib/suppliers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, packages } = useData();
  const s = suppliers.find((x) => x.id === id);

  if (!s) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/fornecedores")}><ArrowLeft className="h-4 w-4" /> Voltar</Button>
        <p className="text-muted-foreground">Fornecedor não encontrado.</p>
      </div>
    );
  }

  const linked = packages.filter((p) => p.supplierId === s.id || p.supplier === s.name);
  const totalRevenue = linked.reduce((sum, p) => sum + p.totalValue, 0);
  const totalCommission = linked.reduce((sum, p) => sum + (p.totalValue * p.commissionPercent) / 100, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/fornecedores")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0">
            <p className="label-caption mb-1">Fornecedor</p>
            <h1 className="text-2xl tracking-tight truncate">{s.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]", supplierCategoryBadge[s.category])}>
                {supplierCategoryLabels[s.category]}
              </span>
              {s.active ? (
                <span className="inline-flex items-center rounded-full bg-success-soft text-success-soft-foreground px-2.5 py-0.5 text-[11px] font-semibold uppercase">Ativo</span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[11px] font-semibold uppercase">Inativo</span>
              )}
              <div className="inline-flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={cn("h-3.5 w-3.5", n <= s.rating ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-muted-foreground/30")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Informações</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="label-caption">CNPJ</p>
            <p className="text-sm font-mono mt-0.5">{s.cnpj || "—"}</p>
          </div>
          <div>
            <p className="label-caption">Site</p>
            {s.website ? (
              <a href={s.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-0.5 inline-flex items-center gap-1">
                <Globe className="h-3 w-3" /> {s.website.replace(/^https?:\/\//, "")}
              </a>
            ) : <p className="text-sm mt-0.5">—</p>}
          </div>
          <div>
            <p className="label-caption">Contato comercial</p>
            <p className="text-sm font-medium mt-0.5">{s.contactName || "—"}</p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Phone className="h-3 w-3" />{s.contactPhone}</p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><Mail className="h-3 w-3" />{s.contactEmail}</p>
          </div>
          <div>
            <p className="label-caption">Comissão padrão</p>
            <p className="text-sm font-semibold text-navy mt-0.5 tabular-nums">{s.defaultCommission}%</p>
            <p className="text-[11px] text-muted-foreground">Prazo: {paymentTermLabels[s.paymentTerm]}</p>
          </div>
          {s.accessNotes && (
            <div className="sm:col-span-2">
              <p className="label-caption">Forma de acesso</p>
              <p className="text-sm whitespace-pre-line mt-0.5 text-muted-foreground">{s.accessNotes}</p>
            </div>
          )}
          {s.notes && (
            <div className="sm:col-span-2">
              <p className="label-caption">Observações</p>
              <p className="text-sm whitespace-pre-line mt-0.5 text-muted-foreground">{s.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Desempenho</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border/70 p-4">
            <p className="label-caption">Reservas vinculadas</p>
            <p className="text-2xl font-bold text-navy tabular-nums mt-1">{linked.length}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-4">
            <p className="label-caption">Receita gerada</p>
            <p className="text-2xl font-bold text-navy tabular-nums mt-1">{fmtCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-4">
            <p className="label-caption">Comissão total</p>
            <p className="text-2xl font-bold text-success tabular-nums mt-1">{fmtCurrency(totalCommission)}</p>
          </div>
          <div className="rounded-lg border border-border/70 p-4">
            <p className="label-caption">Avaliação</p>
            <p className="text-2xl font-bold text-navy tabular-nums mt-1">{s.rating.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/5</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Linked reservations */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Últimas reservas</CardTitle></CardHeader>
        <CardContent>
          {linked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma reserva vinculada</p>
          ) : (
            <div className="space-y-2">
              {linked.slice(0, 8).map((p) => (
                <div key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 p-3 cursor-pointer hover:bg-muted/40"
                  onClick={() => navigate(`/pacotes/${p.id}`)}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{p.destinationFlag} {p.destinationCity}, {p.destinationCountry}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{p.clientName} · {fmtDate(p.departureDate)}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums shrink-0">{fmtCurrency(p.totalValue)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierDetail;

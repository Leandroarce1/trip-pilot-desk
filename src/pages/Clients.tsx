import { useEffect, useState } from "react";
import { Plus, Search, Phone, Mail, Eye, Sparkles, FileText, ArrowRight, Download, Loader2 } from "lucide-react";
import { exportCsv } from "@/lib/exportCsv";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StatusBadge, clientStatusOptions } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { Client } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fmtDate, formatDocument, formatPhone } from "@/lib/format";
import { SalesJourney } from "@/components/SalesJourney";
import { BackButton } from "@/components/BackButton";
import { NextStepBanner } from "@/components/NextStepBanner";

const Clients = () => {
  const { clients, addClient, updateClient, addOpportunity, opportunities } = useData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus || "all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", document: "", notes: "",
    status: (urlStatus as Client["status"]) || "lead" as Client["status"],
    destination: "", travelDate: "", returnDate: "", budget: "", travelersCount: "2", leadSource: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Sync filter with URL ?status=
  useEffect(() => {
    if (urlStatus) setStatusFilter(urlStatus);
  }, [urlStatus]);

  const isLeadsView = statusFilter === "lead";

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = async () => {
    if (!form.name || !form.phone) { toast.error("Nome e telefone são obrigatórios"); return; }
    setSubmitting(true);
    try {
      const created = await addClient({
        name: form.name, phone: form.phone, email: form.email,
        document: form.document, notes: form.notes, status: form.status,
        profile: form.leadSource ? { originChannel: form.leadSource as any } : undefined,
      } as any);

      const hasTravel = !!(form.destination || form.travelDate || form.budget);
      if (hasTravel && form.status === "lead" && created && (created as any).id) {
        await addOpportunity({
          clientId: (created as Client).id,
          title: `Oportunidade — ${form.name}`,
          destination: form.destination,
          estimatedValue: Number(form.budget) || 0,
          probability: 50,
          stage: "new",
          position: Date.now(),
          expectedCloseDate: form.travelDate || undefined,
          returnDate: form.returnDate || undefined,
          travelersCount: Number(form.travelersCount) || 1,
          leadSource: form.leadSource || undefined,
          notes: `Originada do lead ${form.name}${form.travelDate ? ` · viagem em ${form.travelDate}` : ""}${form.leadSource ? ` · origem ${form.leadSource}` : ""}`,
        });
      }

      setForm({ name: "", phone: "", email: "", document: "", notes: "", status: "lead", destination: "", travelDate: "", returnDate: "", budget: "", travelersCount: "2", leadSource: "" });
      setOpen(false);
      toast.success(hasTravel ? "Lead criado + oportunidade gerada!" : "Cliente cadastrado!", {
        action: hasTravel ? { label: "Ver pipeline", onClick: () => navigate("/oportunidades") } : undefined,
      });
    } catch {
      toast.error("Erro ao cadastrar");
    } finally {
      setSubmitting(false);
    }
  };

  const convertToOpportunity = async (c: Client) => {
    if (c.status !== "lead") return;
    try {
      // Promove cliente
      await updateClient({ ...c, status: "negotiation" });
      // Cria oportunidade vinculada ao lead se ainda não existir
      const exists = opportunities.some((o) => o.clientId === c.id);
      if (!exists) {
        await addOpportunity({
          clientId: c.id,
          title: `Oportunidade — ${c.name}`,
          destination: "",
          estimatedValue: 0,
          probability: 50,
          stage: "new",
          position: Date.now(),
          notes: `Originada do lead ${c.name}`,
        });
      }
      toast.success("Convertido em oportunidade", {
        description: `${c.name} agora está no pipeline.`,
        action: { label: "Ver pipeline", onClick: () => navigate("/oportunidades") },
      });
    } catch {
      toast.error("Erro ao converter lead");
    }
  };

  const createProposalFor = (c: Client) => {
    // Promove para negociação se ainda for lead
    if (c.status === "lead") updateClient({ ...c, status: "negotiation" });
    navigate(`/cotacoes?client=${c.id}`);
    toast("Abrindo cotações", { description: `Crie uma proposta para ${c.name}.` });
  };

  // Próximo lead a converter (mais antigo)
  const nextLead = [...clients]
    .filter((c) => c.status === "lead")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];

  return (
    <div className="space-y-6">
      <BackButton fallback="/" />
      <SalesJourney current="lead" />

      {nextLead && (
        <NextStepBanner
          tone="primary"
          icon={<Sparkles className="h-4 w-4" />}
          title={`Converter ${nextLead.name} em oportunidade`}
          description={`${nextLead.phone} · cadastrado em ${fmtDate(nextLead.createdAt)} — mover para negociação`}
          actionLabel="Converter agora"
          onAction={() => convertToOpportunity(nextLead)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isLeadsView ? "Leads" : "Clientes"}</h1>
          <p className="text-sm text-muted-foreground">
            {isLeadsView
              ? `${clients.filter((c) => c.status === "lead").length} leads ativos`
              : `${clients.length} clientes cadastrados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (filtered.length === 0) { toast.error("Nada para exportar"); return; }
              exportCsv("clientes", [
                { header: "Nome", value: (c) => c.name },
                { header: "Telefone", value: (c) => c.phone },
                { header: "E-mail", value: (c) => c.email },
                { header: "Documento", value: (c) => c.document },
                { header: "Status", value: (c) => c.status },
                { header: "Cadastrado em", value: (c) => fmtDate(c.createdAt) },
                { header: "Observações", value: (c) => c.notes },
              ], filtered);
              toast.success(`${filtered.length} cliente(s) exportado(s)`);
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> {isLeadsView ? "Novo Lead" : "Novo Cliente"}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isLeadsView ? "Novo Lead" : "Novo Cliente"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Telefone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Documento</Label><Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Client["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {clientStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">Interesse de viagem (opcional)</p>
                <p className="text-[11px] text-muted-foreground -mt-2">Se preenchido, gera automaticamente uma oportunidade no pipeline.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label className="text-xs">Destino desejado</Label><Input placeholder="Ex: Cancún, México" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
                  <div><Label className="text-xs">Origem do contato</Label>
                    <Select value={form.leadSource} onValueChange={(v) => setForm({ ...form, leadSource: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="referral">Indicação</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="in-person">Presencial</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Data de ida</Label><Input type="date" value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} /></div>
                  <div><Label className="text-xs">Data de volta</Label><Input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} /></div>
                  <div><Label className="text-xs">Nº viajantes</Label><Input type="number" min={1} value={form.travelersCount} onChange={(e) => setForm({ ...form, travelersCount: e.target.value })} /></div>
                  <div><Label className="text-xs">Orçamento (R$)</Label><Input type="number" placeholder="18000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                </div>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Cadastrando..." : "Cadastrar Cliente"}
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            if (v === "all") setSearchParams({});
            else setSearchParams({ status: v });
          }}
        >
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {clientStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Contato</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Cadastro</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/clientes/${c.id}`)}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{formatPhone(c.phone)}</span>
                      <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDocument(c.document)}</td>
                  <td className="px-4 py-3"><StatusBadge variant={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell tabular-nums">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.status === "lead" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => { e.stopPropagation(); convertToOpportunity(c); }}
                          title="Converter em oportunidade"
                        >
                          <Sparkles className="h-3 w-3" /> Converter
                        </Button>
                      )}
                      {c.status === "negotiation" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1 border-success/40 text-success hover:bg-success hover:text-white"
                          onClick={(e) => { e.stopPropagation(); createProposalFor(c); }}
                          title="Criar proposta"
                        >
                          <FileText className="h-3 w-3" /> Proposta
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/clientes/${c.id}`); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;

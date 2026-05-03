import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, FileText, Edit2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Opportunity, OpportunityStage } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";
import { SalesJourney } from "@/components/SalesJourney";
import { NextStepBanner } from "@/components/NextStepBanner";
import { ArrowRight, FileText as FileTextIcon } from "lucide-react";

const STAGE_LABELS: Record<OpportunityStage, string> = {
  new: "Novo", contact: "Em contato", proposal: "Proposta",
  closed_won: "Ganho", closed_lost: "Perdido",
};

const STAGE_TONES: Record<OpportunityStage, string> = {
  new: "bg-info-soft text-info-soft-foreground",
  contact: "bg-warning-soft text-warning-soft-foreground",
  proposal: "bg-primary/15 text-primary",
  closed_won: "bg-success-soft text-success-soft-foreground",
  closed_lost: "bg-error-soft text-error-soft-foreground",
};

const emptyForm = {
  clientId: "", title: "", destination: "", estimatedValue: "",
  probability: "50", expectedCloseDate: "", notes: "", stage: "new" as OpportunityStage,
};

export default function Opportunities() {
  const navigate = useNavigate();
  const { opportunities, clients, addOpportunity, updateOpportunity, deleteOpportunity, addQuote } = useData();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const matchSearch = !search ||
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.clientName.toLowerCase().includes(search.toLowerCase()) ||
        o.destination.toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === "all" || o.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [opportunities, search, stageFilter]);

  const totalValue = filtered.reduce((acc, o) => acc + o.estimatedValue, 0);
  const weightedValue = filtered.reduce((acc, o) => acc + (o.estimatedValue * o.probability / 100), 0);

  const handleSubmit = async () => {
    if (!form.title) { toast.error("Informe um título"); return; }
    try {
      const payload = {
        clientId: form.clientId,
        title: form.title,
        destination: form.destination,
        estimatedValue: Number(form.estimatedValue) || 0,
        probability: Number(form.probability) || 50,
        expectedCloseDate: form.expectedCloseDate || undefined,
        notes: form.notes,
        stage: form.stage,
        position: editing?.position ?? Date.now(),
      };
      if (editing) {
        await updateOpportunity({ ...editing, ...payload });
        toast.success("Atualizada");
      } else {
        await addOpportunity(payload);
        toast.success("Criada");
      }
      handleClose(false);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptyForm); }
  };

  const openEdit = (o: Opportunity) => {
    setEditing(o);
    setForm({
      clientId: o.clientId, title: o.title, destination: o.destination,
      estimatedValue: String(o.estimatedValue), probability: String(o.probability),
      expectedCloseDate: o.expectedCloseDate ?? "", notes: o.notes, stage: o.stage,
    });
    setOpen(true);
  };

  const createProposal = async (o: Opportunity) => {
    if (!o.clientId) { toast.error("Vincule um cliente antes de criar a proposta"); return; }
    try {
      const quote = await addQuote({
        clientId: o.clientId,
        destination: o.destination || o.title,
        startDate: "",
        endDate: "",
        value: o.estimatedValue,
        description: o.notes,
        status: "draft",
        opportunityId: o.id,
      });
      // Avança oportunidade para "proposal"
      if (o.stage !== "proposal" && o.stage !== "closed_won") {
        await updateOpportunity({ ...o, stage: "proposal" });
      }
      toast.success("Proposta criada como rascunho", {
        action: { label: "Ver propostas", onClick: () => navigate("/cotacoes") },
      });
    } catch {
      toast.error("Erro ao criar proposta");
    }
  };

  // Próxima oportunidade a virar proposta
  const nextOpp = [...opportunities]
    .filter((o) => o.stage !== "closed_won" && o.stage !== "closed_lost" && o.clientId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];

  return (
    <div className="space-y-6">
      <SalesJourney current="opportunity" completed={["lead"]} />

      {nextOpp && (
        <NextStepBanner
          tone="primary"
          icon={<FileTextIcon className="h-4 w-4" />}
          title={`Criar proposta para ${nextOpp.clientName || nextOpp.title}`}
          description={`${nextOpp.destination || "destino a definir"} · valor estimado R$ ${nextOpp.estimatedValue.toLocaleString("pt-BR")}`}
          actionLabel="Criar proposta"
          onAction={() => createProposal(nextOpp)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Oportunidades</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} oportunidade(s) listadas</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova oportunidade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar oportunidade" : "Nova oportunidade"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destino</Label>
                <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor (R$)</Label>
                  <Input type="number" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
                </div>
                <div>
                  <Label>Probabilidade (%)</Label>
                  <Input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fechamento previsto</Label>
                  <Input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
                </div>
                <div>
                  <Label>Etapa</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as OpportunityStage })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STAGE_LABELS) as OpportunityStage[]).map((k) => (
                        <SelectItem key={k} value={k}>{STAGE_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold tabular-nums mt-1">R$ {totalValue.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Ponderado</p>
          <p className="text-xl font-bold tabular-nums mt-1 text-primary">R$ {weightedValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Em pipeline</p>
          <p className="text-xl font-bold tabular-nums mt-1">
            {opportunities.filter((o) => o.stage !== "closed_won" && o.stage !== "closed_lost").length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            {(Object.keys(STAGE_LABELS) as OpportunityStage[]).map((k) => (
              <SelectItem key={k} value={k}>{STAGE_LABELS[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Nenhuma oportunidade encontrada.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Prob.</TableHead>
                <TableHead>Fechamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <div>{o.title}</div>
                    {o.destination && <div className="text-xs text-muted-foreground">{o.destination}</div>}
                  </TableCell>
                  <TableCell>
                    {o.clientName ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{o.clientName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Origem: Lead</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${STAGE_TONES[o.stage]}`}>
                      {STAGE_LABELS[o.stage]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">R$ {o.estimatedValue.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right tabular-nums">{o.probability}%</TableCell>
                  <TableCell className="text-xs tabular-nums">{o.expectedCloseDate ? fmtDate(o.expectedCloseDate) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => createProposal(o)} className="gap-1.5 h-7 text-xs">
                        <FileText className="h-3 w-3" />Criar proposta
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(o)} className="h-7 w-7 p-0">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir oportunidade?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={async () => { await deleteOpportunity(o.id); toast.success("Excluída"); }}
                            >Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

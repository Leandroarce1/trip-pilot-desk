import { useMemo, useState } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor,
  useDroppable, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Plus, MapPin, User, DollarSign, Calendar, Trash2, Download } from "lucide-react";
import { exportCsv } from "@/lib/exportCsv";
import { useData } from "@/contexts/DataContext";
import { Opportunity, OpportunityStage } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";

const STAGES: { id: OpportunityStage; label: string; tone: string }[] = [
  { id: "new", label: "Novo", tone: "border-t-info" },
  { id: "contact", label: "Em contato", tone: "border-t-warning" },
  { id: "proposal", label: "Proposta", tone: "border-t-primary" },
  { id: "closed_won", label: "Fechado (ganho)", tone: "border-t-success" },
  { id: "closed_lost", label: "Perdido", tone: "border-t-destructive" },
];

const emptyForm = {
  clientId: "",
  title: "",
  destination: "",
  estimatedValue: "",
  probability: "50",
  expectedCloseDate: "",
  notes: "",
  stage: "new" as OpportunityStage,
  owner: "",
};

function OpportunityCard({ op, onDelete }: { op: Opportunity; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: op.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground line-clamp-2">{op.title}</h4>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
          aria-label="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        {op.clientName && <p className="flex items-center gap-1.5"><User className="h-3 w-3" />{op.clientName}</p>}
        {op.destination && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{op.destination}</p>}
        {op.expectedCloseDate && (
          <p className="flex items-center gap-1.5 tabular-nums"><Calendar className="h-3 w-3" />{fmtDate(op.expectedCloseDate)}</p>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between border-t pt-2">
        <span className="text-sm font-bold text-foreground tabular-nums">
          R$ {op.estimatedValue.toLocaleString("pt-BR")}
        </span>
        <span className="text-[10px] font-bold text-primary">{op.probability}%</span>
      </div>
    </div>
  );
}

function Column({ stage, items, onDelete }: {
  stage: typeof STAGES[number];
  items: Opportunity[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = items.reduce((acc, o) => acc + o.estimatedValue, 0);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[280px] shrink-0 rounded-xl bg-muted/30 border-t-[3px] transition-colors",
        stage.tone,
        isOver && "bg-primary/5 ring-2 ring-primary/30",
      )}
    >
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{stage.label}</h3>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">{items.length}</span>
        </div>
        <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
          R$ {total.toLocaleString("pt-BR")}
        </p>
      </div>
      <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-6">Solte cards aqui</p>
        ) : (
          items.map((op) => <OpportunityCard key={op.id} op={op} onDelete={() => onDelete(op.id)} />)
        )}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { opportunities, clients, addOpportunity, updateOpportunity, deleteOpportunity } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const map: Record<OpportunityStage, Opportunity[]> = {
      new: [], contact: [], proposal: [], closed_won: [], closed_lost: [],
    };
    opportunities.forEach((o) => map[o.stage].push(o));
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [opportunities]);

  const activeOp = activeId ? opportunities.find((o) => o.id === activeId) : null;

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const opId = String(e.active.id);
    const targetStage = e.over.id as OpportunityStage;
    const op = opportunities.find((o) => o.id === opId);
    if (!op || op.stage === targetStage) return;
    try {
      await updateOpportunity({ ...op, stage: targetStage });
      toast.success(`Movido para "${STAGES.find((s) => s.id === targetStage)?.label}"`);
    } catch {
      toast.error("Erro ao mover");
    }
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error("Informe um título"); return; }
    try {
      await addOpportunity({
        clientId: form.clientId,
        title: form.title,
        destination: form.destination,
        estimatedValue: Number(form.estimatedValue) || 0,
        probability: Number(form.probability) || 50,
        expectedCloseDate: form.expectedCloseDate || undefined,
        notes: form.notes,
        stage: form.stage,
        position: Date.now(),
      });
      toast.success("Oportunidade criada");
      setForm(emptyForm);
      setOpen(false);
    } catch {
      toast.error("Erro ao criar");
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteOpportunity(id); toast.success("Excluída"); }
    catch { toast.error("Erro ao excluir"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {opportunities.length} oportunidade(s) · arraste os cards para mover de etapa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (opportunities.length === 0) { toast.error("Nada para exportar"); return; }
              exportCsv("pipeline-oportunidades", [
                { header: "Título", value: (o) => o.title },
                { header: "Cliente", value: (o) => o.clientName },
                { header: "Destino", value: (o) => o.destination },
                { header: "Etapa", value: (o) => STAGES.find((s) => s.id === o.stage)?.label ?? o.stage },
                { header: "Valor estimado (R$)", value: (o) => o.estimatedValue },
                { header: "Probabilidade (%)", value: (o) => o.probability },
                { header: "Fechamento previsto", value: (o) => o.expectedCloseDate ? fmtDate(o.expectedCloseDate) : "" },
                { header: "Observações", value: (o) => o.notes },
              ], opportunities);
              toast.success(`${opportunities.length} oportunidade(s) exportada(s)`);
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nova oportunidade</Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Nova oportunidade</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Lua de mel Maldivas" />
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
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
                    <SelectContent>{STAGES.map((s) => (<SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">Criar</Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <DollarSign className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold">Nenhuma oportunidade ainda</h3>
          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira oportunidade para começar a movimentar o pipeline.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <Column key={stage.id} stage={stage} items={grouped[stage.id]} onDelete={handleDelete} />
            ))}
          </div>
          <DragOverlay>
            {activeOp ? <OpportunityCard op={activeOp} onDelete={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

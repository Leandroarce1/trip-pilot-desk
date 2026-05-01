import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, MapPin, Calendar as CalendarIcon, CheckCircle2, Package as PackageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { Quote, ItineraryDay } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";
import { SalesJourney } from "@/components/SalesJourney";
import { NextStepBanner } from "@/components/NextStepBanner";

const emptyForm = { clientId: "", destination: "", startDate: "", endDate: "", value: "", description: "", status: "sent" as Quote["status"] };
const emptyDay: ItineraryDay = { day: 1, title: "", description: "" };

const Quotes = () => {
  const navigate = useNavigate();
  const { quotes, clients, addQuote, updateQuote, deleteQuote, addPackage, updateClient } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const filtered = quotes.filter((q) => {
    const matchSearch = q.clientName.toLowerCase().includes(search.toLowerCase()) || q.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = () => {
    if (!form.clientId || !form.destination || !form.value) { toast.error("Preencha os campos obrigatórios"); return; }
    const cleanItinerary = itinerary.filter((d) => d.title.trim() !== "");
    if (editingQuote) {
      updateQuote({ ...editingQuote, ...form, value: Number(form.value), clientName: clients.find((c) => c.id === form.clientId)?.name || "", itinerary: cleanItinerary.length > 0 ? cleanItinerary : undefined });
      toast.success("Cotação atualizada!");
    } else {
      addQuote({ clientId: form.clientId, destination: form.destination, startDate: form.startDate, endDate: form.endDate, value: Number(form.value), description: form.description, status: form.status, itinerary: cleanItinerary.length > 0 ? cleanItinerary : undefined });
      toast.success("Cotação criada!");
    }
    setForm(emptyForm);
    setItinerary([]);
    setEditingQuote(null);
    setOpen(false);
  };

  const openEdit = (q: Quote) => {
    setEditingQuote(q);
    setForm({ clientId: q.clientId, destination: q.destination, startDate: q.startDate, endDate: q.endDate, value: String(q.value), description: q.description, status: q.status });
    setItinerary(q.itinerary || []);
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditingQuote(null); setForm(emptyForm); setItinerary([]); }
  };

  const addDay = () => {
    setItinerary((prev) => [...prev, { day: prev.length + 1, title: "", description: "" }]);
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: string | number) => {
    setItinerary((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const removeDay = (index: number) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cotações</h1>
          <p className="text-sm text-muted-foreground">{quotes.length} cotações</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nova Cotação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingQuote ? "Editar Cotação" : "Nova Cotação"}</DialogTitle></DialogHeader>
            <Tabs defaultValue="info" className="pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
                <TabsTrigger value="itinerary" className="flex-1">Itinerário</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 mt-4">
                <div>
                  <Label>Cliente *</Label>
                  <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label>Destino *</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Data ida</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div><Label>Data volta</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Valor (R$) *</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Quote["status"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="approved">Aprovada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descrição do pacote</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </TabsContent>
              <TabsContent value="itinerary" className="space-y-4 mt-4">
                <p className="text-xs text-muted-foreground">Adicione o roteiro dia a dia para compartilhar com o cliente.</p>
                {itinerary.map((day, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">Dia {day.day}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => removeDay(i)}>Remover</Button>
                    </div>
                    <Input placeholder="Título (ex: Chegada em Cancún)" value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} />
                    <Textarea placeholder="Descrição das atividades..." value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} className="min-h-[60px]" />
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addDay}>
                  <Plus className="mr-2 h-4 w-4" />Adicionar Dia {itinerary.length + 1}
                </Button>
              </TabsContent>
            </Tabs>
            <Button onClick={handleSubmit} className="w-full mt-4">{editingQuote ? "Salvar" : "Criar Cotação"}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou destino..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="approved">Aprovada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((q) => (
          <div key={q.id} className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{q.destination}</h3>
                <p className="text-sm text-muted-foreground">{q.clientName}</p>
              </div>
              <StatusBadge variant={q.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              {q.startDate && q.endDate && <p className="flex items-center gap-1 tabular-nums"><CalendarIcon className="h-3 w-3" />{fmtDate(q.startDate)} → {fmtDate(q.endDate)}</p>}
              {q.description && <p className="mt-1">{q.description}</p>}
              {q.itinerary && q.itinerary.length > 0 && (
                <p className="mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{q.itinerary.length} dia(s) no roteiro</p>
              )}
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <p className="text-lg font-bold text-foreground">R$ {q.value.toLocaleString("pt-BR")}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/reserva/${q.id}`)} title="Ver proposta"><Eye className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(q)}><Edit2 className="h-3.5 w-3.5" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Excluir cotação?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { deleteQuote(q.id); toast.success("Cotação excluída!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quotes;

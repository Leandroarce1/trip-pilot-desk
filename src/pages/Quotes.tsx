import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { Quote } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const emptyForm = { clientId: "", destination: "", startDate: "", endDate: "", value: "", description: "", status: "sent" as Quote["status"] };

const Quotes = () => {
  const { quotes, clients, addQuote, updateQuote, deleteQuote } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = quotes.filter((q) => {
    const matchSearch = q.clientName.toLowerCase().includes(search.toLowerCase()) || q.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = () => {
    if (!form.clientId || !form.destination || !form.value) { toast.error("Preencha os campos obrigatórios"); return; }
    if (editingQuote) {
      updateQuote({ ...editingQuote, ...form, value: Number(form.value), clientName: clients.find((c) => c.id === form.clientId)?.name || "" });
      toast.success("Cotação atualizada!");
    } else {
      addQuote({ clientId: form.clientId, destination: form.destination, startDate: form.startDate, endDate: form.endDate, value: Number(form.value), description: form.description, status: form.status });
      toast.success("Cotação criada!");
    }
    setForm(emptyForm);
    setEditingQuote(null);
    setOpen(false);
  };

  const openEdit = (q: Quote) => {
    setEditingQuote(q);
    setForm({ clientId: q.clientId, destination: q.destination, startDate: q.startDate, endDate: q.endDate, value: String(q.value), description: q.description, status: q.status });
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditingQuote(null); setForm(emptyForm); }
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
          <DialogContent>
            <DialogHeader><DialogTitle>{editingQuote ? "Editar Cotação" : "Nova Cotação"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
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
              <Button onClick={handleSubmit} className="w-full">{editingQuote ? "Salvar" : "Criar Cotação"}</Button>
            </div>
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
              {q.startDate && q.endDate && <p>{q.startDate} → {q.endDate}</p>}
              {q.description && <p className="mt-1">{q.description}</p>}
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <p className="text-lg font-bold text-foreground">R$ {q.value.toLocaleString("pt-BR")}</p>
              <div className="flex gap-1">
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

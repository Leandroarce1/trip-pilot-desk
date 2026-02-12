import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Eye, MapPin, Calendar, Plane, DollarSign } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { TravelPackage } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusLabels: Record<TravelPackage["status"], string> = {
  planning: "Planejamento",
  confirmed: "Confirmado",
  traveling: "Em viagem",
  completed: "Concluído",
};

const statusColors: Record<TravelPackage["status"], string> = {
  planning: "bg-info/15 text-info",
  confirmed: "bg-success/15 text-success",
  traveling: "bg-warning/15 text-warning",
  completed: "bg-muted text-muted-foreground",
};

const emptyForm = { name: "", clientId: "", quoteId: "", flightIds: [] as string[], transactionIds: [] as string[], status: "planning" as TravelPackage["status"], notes: "" };

const Packages = () => {
  const navigate = useNavigate();
  const { packages, clients, quotes, flights, transactions, addPackage, updatePackage, deletePackage } = useData();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TravelPackage | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = packages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.name || !form.clientId) { toast.error("Preencha nome e cliente"); return; }
    if (editing) {
      updatePackage({ ...editing, ...form, clientName: clients.find((c) => c.id === form.clientId)?.name || "" });
      toast.success("Pacote atualizado!");
    } else {
      addPackage(form);
      toast.success("Pacote criado!");
    }
    setForm(emptyForm);
    setEditing(null);
    setOpen(false);
  };

  const openEdit = (p: TravelPackage) => {
    setEditing(p);
    setForm({ name: p.name, clientId: p.clientId, quoteId: p.quoteId || "", flightIds: p.flightIds, transactionIds: p.transactionIds, status: p.status, notes: p.notes });
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptyForm); }
  };

  const clientFlights = flights.filter((f) => f.clientId === form.clientId);
  const clientQuotes = quotes.filter((q) => q.clientId === form.clientId);
  const clientTransactions = transactions.filter((t) => {
    const client = clients.find((c) => c.id === form.clientId);
    return client && t.clientName === client.name;
  });

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacotes de Viagem</h1>
          <p className="text-sm text-muted-foreground">{packages.length} pacotes</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Pacote</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar Pacote" : "Novo Pacote de Viagem"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Nome do Pacote *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Cancún All-Inclusive" /></div>
              <div>
                <Label>Cliente *</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v, quoteId: "", flightIds: [], transactionIds: [] })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              {form.clientId && (
                <>
                  <div>
                    <Label>Cotação vinculada</Label>
                    <Select value={form.quoteId || "none"} onValueChange={(v) => setForm({ ...form, quoteId: v === "none" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {clientQuotes.map((q) => (<SelectItem key={q.id} value={q.id}>{q.destination} - R$ {q.value.toLocaleString("pt-BR")}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  {clientFlights.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Voos vinculados</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {clientFlights.map((f) => (
                          <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={form.flightIds.includes(f.id)}
                              onCheckedChange={() => setForm({ ...form, flightIds: toggleArrayItem(form.flightIds, f.id) })}
                            />
                            {f.flightNumber} · {f.origin} → {f.destination} · {f.departureDate}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {clientTransactions.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Pagamentos vinculados</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {clientTransactions.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={form.transactionIds.includes(t.id)}
                              onCheckedChange={() => setForm({ ...form, transactionIds: toggleArrayItem(form.transactionIds, t.id) })}
                            />
                            {t.description} · R$ {t.value.toLocaleString("pt-BR")}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TravelPackage["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="traveling">Em viagem</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Salvar" : "Criar Pacote"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar pacotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const quote = quotes.find((q) => q.id === p.quoteId);
          const pkgFlights = flights.filter((f) => p.flightIds.includes(f.id));
          const pkgTransactions = transactions.filter((t) => p.transactionIds.includes(t.id));
          const totalPaid = pkgTransactions.filter((t) => t.status === "paid").reduce((s, t) => s + t.value, 0);
          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.clientName}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusColors[p.status])}>
                    {statusLabels[p.status]}
                  </span>
                </div>
                {quote && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{quote.destination}</span>
                    <span className="ml-auto font-semibold text-foreground">R$ {quote.value.toLocaleString("pt-BR")}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Plane className="h-3 w-3" />{pkgFlights.length} voo(s)</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />R$ {totalPaid.toLocaleString("pt-BR")} pago</span>
                  {quote && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{quote.startDate}</span>}
                </div>
                <div className="border-t pt-3 flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/pacotes/${p.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Excluir pacote?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { deletePackage(p.id); toast.success("Pacote excluído!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">Nenhum pacote encontrado</p>
        )}
      </div>
    </div>
  );
};

export default Packages;

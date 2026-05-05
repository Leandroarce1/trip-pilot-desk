import { useState } from "react";
import { Plus, Search, Plane, Edit2, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Flight } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";
import { BackButton } from "@/components/BackButton";

const emptyForm = { clientId: "", airline: "", flightNumber: "", origin: "", destination: "", departureDate: "", departureTime: "" };

const Flights = () => {
  const { flights, clients, addFlight, updateFlight, deleteFlight } = useData();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = flights.filter(
    (f) => f.clientName.toLowerCase().includes(search.toLowerCase()) || f.flightNumber.toLowerCase().includes(search.toLowerCase())
  );

  const isCheckinSoon = (f: Flight) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
    const now = new Date();
    const diff = dep.getTime() - now.getTime();
    return diff > 0 && diff <= 48 * 60 * 60 * 1000;
  };

  const handleSubmit = () => {
    if (!form.clientId || !form.flightNumber || !form.departureDate) { toast.error("Preencha os campos obrigatórios"); return; }
    if (editingFlight) {
      updateFlight({ ...editingFlight, ...form, clientName: clients.find((c) => c.id === form.clientId)?.name || "" });
      toast.success("Voo atualizado!");
    } else {
      addFlight({ ...form, checkinAlert: true });
      toast.success("Voo registrado!");
    }
    setForm(emptyForm);
    setEditingFlight(null);
    setOpen(false);
  };

  const openEdit = (f: Flight) => {
    setEditingFlight(f);
    setForm({ clientId: f.clientId, airline: f.airline, flightNumber: f.flightNumber, origin: f.origin, destination: f.destination, departureDate: f.departureDate, departureTime: f.departureTime });
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditingFlight(null); setForm(emptyForm); }
  };

  return (
    <div className="space-y-6">
      <BackButton fallback="/" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voos</h1>
          <p className="text-sm text-muted-foreground">{flights.length} voos registrados</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Voo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingFlight ? "Editar Voo" : "Registrar Voo"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Cliente *</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Companhia aérea</Label><Input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} /></div>
                <div><Label>Nº do voo *</Label><Input value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Origem</Label><Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Ex: GRU" /></div>
                <div><Label>Destino</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Ex: MIA" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Data *</Label><Input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} /></div>
                <div><Label>Horário</Label><Input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} /></div>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingFlight ? "Salvar" : "Registrar Voo"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por cliente ou nº do voo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Passageiro</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Voo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Rota</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data/Hora</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{f.clientName}</td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">{f.airline}</span>{" "}
                    <span className="font-mono font-medium">{f.flightNumber}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="flex items-center gap-1">{f.origin} <Plane className="h-3 w-3 text-muted-foreground" /> {f.destination}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{fmtDate(f.departureDate)} {f.departureTime}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {isCheckinSoon(f) ? (
                      <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning">Check-in!</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(f)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Excluir voo?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deleteFlight(f.id); toast.success("Voo excluído!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

export default Flights;

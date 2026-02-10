import { useState } from "react";
import { Plus, Search, Plane } from "lucide-react";
import { mockFlights, mockClients } from "@/data/mockData";
import { Flight } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Flights = () => {
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", airline: "", flightNumber: "", origin: "", destination: "", departureDate: "", departureTime: "" });

  const filtered = flights.filter(
    (f) => f.clientName.toLowerCase().includes(search.toLowerCase()) || f.flightNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.clientId || !form.flightNumber || !form.departureDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    const client = mockClients.find((c) => c.id === form.clientId);
    const newFlight: Flight = {
      id: String(Date.now()),
      clientId: form.clientId,
      clientName: client?.name || "",
      airline: form.airline,
      flightNumber: form.flightNumber,
      origin: form.origin,
      destination: form.destination,
      departureDate: form.departureDate,
      departureTime: form.departureTime,
      checkinAlert: true,
    };
    setFlights([newFlight, ...flights]);
    setForm({ clientId: "", airline: "", flightNumber: "", origin: "", destination: "", departureDate: "", departureTime: "" });
    setOpen(false);
    toast.success("Voo registrado!");
  };

  const isCheckinSoon = (f: Flight) => {
    const dep = new Date(`${f.departureDate}T${f.departureTime || "00:00"}`);
    const now = new Date();
    const diff = dep.getTime() - now.getTime();
    return diff > 0 && diff <= 48 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voos</h1>
          <p className="text-sm text-muted-foreground">{flights.length} voos registrados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Voo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Voo</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Cliente *</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {mockClients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
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
              <Button onClick={handleAdd} className="w-full">Registrar Voo</Button>
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
                    <span className="flex items-center gap-1">
                      {f.origin} <Plane className="h-3 w-3 text-muted-foreground" /> {f.destination}
                    </span>
                  </td>
                  <td className="px-4 py-3">{f.departureDate} {f.departureTime}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {isCheckinSoon(f) ? (
                      <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning">Check-in!</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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

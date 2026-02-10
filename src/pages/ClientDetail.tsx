import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, FileText, Plane, DollarSign, Edit2, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Client } from "@/types/crm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, quotes, flights, transactions, updateClient, deleteClient } = useData();
  const client = clients.find((c) => c.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Client | null>(null);

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/clientes")}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <p className="text-muted-foreground">Cliente não encontrado.</p>
      </div>
    );
  }

  const clientQuotes = quotes.filter((q) => q.clientId === id);
  const clientFlights = flights.filter((f) => f.clientId === id);
  const clientTransactions = transactions.filter((t) => t.clientName === client.name);

  const handleEdit = () => { setForm({ ...client }); setEditOpen(true); };
  const handleSave = () => {
    if (form) { updateClient(form); setEditOpen(false); toast.success("Cliente atualizado!"); }
  };
  const handleDelete = () => {
    deleteClient(client.id);
    toast.success("Cliente excluído!");
    navigate("/clientes");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clientes")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge variant={client.status} />
            <span className="text-xs text-muted-foreground">Desde {client.createdAt}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit}><Edit2 className="mr-2 h-3.5 w-3.5" />Editar</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Excluir</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Contact info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Telefone</p><p className="text-sm font-medium">{client.phone}</p></div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">E-mail</p><p className="text-sm font-medium">{client.email || "—"}</p></div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Documento</p><p className="text-sm font-medium">{client.document || "—"}</p></div>
        </div>
        {client.notes && (
          <div className="rounded-xl border bg-card p-4 sm:col-span-2 lg:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Observações</p>
            <p className="text-sm">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Quotes */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Cotações ({clientQuotes.length})</h3>
        {clientQuotes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma cotação</p> : (
          <div className="space-y-3">
            {clientQuotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{q.destination}</p>
                  <p className="text-xs text-muted-foreground">{q.startDate} → {q.endDate}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm font-semibold">R$ {q.value.toLocaleString("pt-BR")}</p>
                  <StatusBadge variant={q.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flights */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plane className="h-4 w-4 text-muted-foreground" />Voos ({clientFlights.length})</h3>
        {clientFlights.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum voo</p> : (
          <div className="space-y-3">
            {clientFlights.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{f.airline} • {f.flightNumber}</p>
                  <p className="text-xs text-muted-foreground">{f.origin} → {f.destination}</p>
                </div>
                <p className="text-sm text-muted-foreground">{f.departureDate} às {f.departureTime}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Financeiro ({clientTransactions.length})</h3>
        {clientTransactions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum registro</p> : (
          <div className="space-y-3">
            {clientTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "-"}R$ {t.value.toLocaleString("pt-BR")}
                  </p>
                  <StatusBadge variant={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Documento</Label><Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Client["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="negotiation">Em negociação</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="postSale">Pós-venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDetail;

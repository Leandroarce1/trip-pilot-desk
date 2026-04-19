import { useState } from "react";
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { Transaction } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

const emptyForm = { type: "income" as Transaction["type"], description: "", value: "", date: "", status: "pending" as Transaction["status"], clientName: "" };

const Financial = () => {
  const { transactions, clients, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
  const monthExpense = monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
  const monthProfit = monthIncome - monthExpense;

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || (t.clientName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleSubmit = () => {
    if (!form.description || !form.value || !form.date) { toast.error("Preencha os campos obrigatórios"); return; }
    if (editingTx) {
      updateTransaction({ ...editingTx, type: form.type, description: form.description, value: Number(form.value), date: form.date, status: form.status, clientName: form.clientName || undefined });
      toast.success("Registro atualizado!");
    } else {
      addTransaction({ type: form.type, description: form.description, value: Number(form.value), date: form.date, status: form.status, clientName: form.clientName || undefined });
      toast.success("Registro adicionado!");
    }
    setForm(emptyForm);
    setEditingTx(null);
    setOpen(false);
  };

  const openEdit = (t: Transaction) => {
    setEditingTx(t);
    setForm({ type: t.type, description: t.description, value: String(t.value), date: t.date, status: t.status, clientName: t.clientName || "" });
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditingTx(null); setForm(emptyForm); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Resumo e registros financeiros</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Registro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTx ? "Editar Registro" : "Novo Registro Financeiro"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Transaction["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cliente vinculado</Label>
                  <Select value={form.clientName} onValueChange={(v) => setForm({ ...form, clientName: v })}>
                    <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {clients.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descrição *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Valor (R$) *</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                <div><Label>Data *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Transaction["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingTx ? "Salvar" : "Adicionar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Receitas do Mês" value={`R$ ${monthIncome.toLocaleString("pt-BR")}`} icon={TrendingUp} variant="success" />
        <StatCard title="Despesas do Mês" value={`R$ ${monthExpense.toLocaleString("pt-BR")}`} icon={TrendingDown} variant="warning" />
        <StatCard title="Lucro do Mês" value={`R$ ${monthProfit.toLocaleString("pt-BR")}`} icon={DollarSign} variant={monthProfit >= 0 ? "info" : "default"} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar registros..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {t.type === "income" ? (
                      <span className="inline-flex items-center gap-1 text-success"><TrendingUp className="h-3 w-3" /> Receita</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-destructive"><TrendingDown className="h-3 w-3" /> Despesa</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{t.description}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.clientName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell tabular-nums">{fmtDate(t.date)}</td>
                  <td className="px-4 py-3 text-right font-semibold">R$ {t.value.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3"><StatusBadge variant={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Excluir registro?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deleteTransaction(t.id); toast.success("Registro excluído!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
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

export default Financial;

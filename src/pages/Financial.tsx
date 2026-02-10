import { useState } from "react";
import { Plus, Search, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { mockTransactions } from "@/data/mockData";
import { Transaction } from "@/types/crm";
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

const Financial = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "income" as Transaction["type"], description: "", value: "", date: "", status: "pending" as Transaction["status"] });

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
  const profit = income - expense;

  const filtered = transactions.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.description || !form.value || !form.date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    const newTx: Transaction = {
      id: String(Date.now()),
      type: form.type,
      description: form.description,
      value: Number(form.value),
      date: form.date,
      status: form.status,
    };
    setTransactions([newTx, ...transactions]);
    setForm({ type: "income", description: "", value: "", date: "", status: "pending" });
    setOpen(false);
    toast.success("Registro adicionado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Resumo e registros financeiros</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Registro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Registro Financeiro</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
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
              <Button onClick={handleAdd} className="w-full">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Receitas" value={`R$ ${income.toLocaleString("pt-BR")}`} icon={TrendingUp} variant="success" />
        <StatCard title="Despesas" value={`R$ ${expense.toLocaleString("pt-BR")}`} icon={TrendingDown} variant="warning" />
        <StatCard title="Lucro" value={`R$ ${profit.toLocaleString("pt-BR")}`} icon={DollarSign} variant={profit >= 0 ? "info" : "default"} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar registros..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
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
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{t.date}</td>
                  <td className="px-4 py-3 text-right font-semibold">R$ {t.value.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3"><StatusBadge variant={t.status} /></td>
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

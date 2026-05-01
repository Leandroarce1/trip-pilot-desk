import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus, Search, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2,
  Wallet, AlertCircle, Percent, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { Transaction } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

type FormState = {
  type: Transaction["type"];
  description: string;
  value: string;
  date: string;
  status: Transaction["status"];
  category: string;
  clientId: string;
  packageId: string;
};

const emptyForm: FormState = {
  type: "income", description: "", value: "", date: new Date().toISOString().slice(0, 10),
  status: "pending", category: "", clientId: "", packageId: "",
};

const brl = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const isOverdue = (t: Transaction) => t.status === "pending" && t.date < today();

const Financial = () => {
  const { transactions, clients, packages, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tab, setTab] = useState("overview");
  const [commissionModal, setCommissionModal] = useState<{ open: boolean; packageId: string; packageName: string; clientId: string; pending: number; value: string; date: string }>({ open: false, packageId: "", packageName: "", clientId: "", pending: 0, value: "", date: today() });

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
    const tabParam = searchParams.get("tab");
    const tabMap: Record<string, string> = {
      overview: "overview",
      receivables: "income",
      income: "income",
      payables: "expense",
      expense: "expense",
      commissions: "commissions",
      cashflow: "cashflow",
    };
    if (tabParam && tabMap[tabParam]) setTab(tabMap[tabParam]);
  }, [searchParams]);

  // ---------- KPIs ----------
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
  const monthIncome = monthTx.filter((t) => t.type === "income" && t.status === "paid").reduce((s, t) => s + t.value, 0);
  const monthExpense = monthTx.filter((t) => t.type === "expense" && t.status === "paid").reduce((s, t) => s + t.value, 0);
  const monthProfit = monthIncome - monthExpense;
  const overdueValue = transactions.filter(isOverdue).reduce((s, t) => s + (t.type === "income" ? t.value : 0), 0);

  // ---------- Comissões (a partir de packages) ----------
  const commissions = useMemo(() => {
    return packages
      .filter((p) => p.totalValue > 0 && p.commissionPercent > 0 && p.reservationStatus !== "cancelled")
      .map((p) => {
        const expected = (p.totalValue * p.commissionPercent) / 100;
        const received = transactions
          .filter((t) => t.packageId === p.id && t.category === "commission" && t.status === "paid")
          .reduce((s, t) => s + t.value, 0);
        return {
          packageId: p.id, packageName: p.name, clientName: p.clientName,
          totalValue: p.totalValue, percent: p.commissionPercent,
          expected, received, pending: Math.max(0, expected - received),
          fullyReceived: received >= expected,
        };
      });
  }, [packages, transactions]);

  const commissionPending = commissions.reduce((s, c) => s + c.pending, 0);

  // ---------- Gráfico mensal (últimos 6 meses) ----------
  const chartData = useMemo(() => {
    const months: { key: string; label: string; receitas: number; despesas: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      months.push({
        key,
        label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        receitas: 0, despesas: 0,
      });
    }
    transactions.forEach((t) => {
      const m = months.find((x) => x.key === t.date.slice(0, 7));
      if (!m || t.status !== "paid") return;
      if (t.type === "income") m.receitas += t.value;
      else m.despesas += t.value;
    });
    return months;
  }, [transactions]);

  // ---------- Fluxo de caixa (próximos 60 dias) ----------
  const cashflowData = useMemo(() => {
    const days: { date: string; label: string; entradas: number; saidas: number; saldo: number }[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    // saldo inicial = soma de tudo já pago até hoje (income - expense)
    let runningBalance = transactions
      .filter((t) => t.status === "paid" && t.date <= start.toISOString().slice(0, 10))
      .reduce((s, t) => s + (t.type === "income" ? t.value : -t.value), 0);

    for (let i = 0; i < 60; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const dayTx = transactions.filter((t) => t.date === key && (t.status === "pending" || (t.status === "paid" && i === 0 && false)));
      // consideramos previsão: pendentes + atrasados acumulam no dia 0
      const entradas = dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
      const saidas = dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);

      // Atrasados (pendentes com data passada) entram todos no dia 0
      let extraIn = 0, extraOut = 0;
      if (i === 0) {
        const overdueTx = transactions.filter((t) => t.status === "pending" && t.date < key);
        extraIn = overdueTx.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
        extraOut = overdueTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
      }

      const totalIn = entradas + extraIn;
      const totalOut = saidas + extraOut;
      runningBalance += totalIn - totalOut;
      days.push({
        date: key,
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        entradas: totalIn,
        saidas: totalOut,
        saldo: runningBalance,
      });
    }
    return days;
  }, [transactions]);

  const cashflowFinalBalance = cashflowData[cashflowData.length - 1]?.saldo ?? 0;
  const cashflowTotalIn = cashflowData.reduce((s, d) => s + d.entradas, 0);
  const cashflowTotalOut = cashflowData.reduce((s, d) => s + d.saidas, 0);

  // ---------- Filtros por aba ----------
  const filterFor = (typeOnly?: Transaction["type"]) =>
    transactions.filter((t) => {
      if (typeOnly && t.type !== typeOnly) return false;
      const matchSearch = !search ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        (t.clientName || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ||
        (statusFilter === "overdue" ? isOverdue(t) : t.status === statusFilter);
      return matchSearch && matchStatus;
    });

  // ---------- Form ----------
  const handleSubmit = async () => {
    if (!form.description || !form.value || !form.date) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    const clientName = clients.find((c) => c.id === form.clientId)?.name;
    const payload = {
      type: form.type, description: form.description, value: Number(form.value),
      date: form.date, status: form.status, category: form.category || undefined,
      clientId: form.clientId || undefined, clientName,
      packageId: form.packageId || undefined,
    };
    try {
      if (editingTx) {
        await updateTransaction({ ...editingTx, ...payload });
        toast.success("Registro atualizado!");
      } else {
        await addTransaction(payload);
        toast.success("Registro adicionado!");
      }
      setForm(emptyForm); setEditingTx(null); setOpen(false);
    } catch (e: any) { toast.error("Erro", { description: e.message }); }
  };

  const openEdit = (t: Transaction) => {
    setEditingTx(t);
    setForm({
      type: t.type, description: t.description, value: String(t.value), date: t.date,
      status: t.status, category: t.category ?? "",
      clientId: t.clientId ?? "", packageId: t.packageId ?? "",
    });
    setOpen(true);
  };

  const openNew = (preset?: Partial<FormState>) => {
    setEditingTx(null);
    setForm({ ...emptyForm, ...preset });
    setOpen(true);
  };

  const togglePaid = async (t: Transaction) => {
    try {
      await updateTransaction({ ...t, status: t.status === "paid" ? "pending" : "paid" });
    } catch (e: any) { toast.error("Erro", { description: e.message }); }
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditingTx(null); setForm(emptyForm); }
  };

  // ---------- Tabela genérica ----------
  const renderTable = (rows: Transaction[]) => (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Cliente / Viagem</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Data</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum registro encontrado</td></tr>
            )}
            {rows.map((t) => {
              const overdue = isOverdue(t);
              const pkg = packages.find((p) => p.id === t.packageId);
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{t.description}</div>
                    {t.category && <div className="text-xs text-muted-foreground">{t.category}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    <div>{t.clientName || "—"}</div>
                    {pkg && <div className="text-xs">📦 {pkg.name}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell tabular-nums">{fmtDate(t.date)}</td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "−"} {brl(t.value)}
                  </td>
                  <td className="px-4 py-3">
                    {overdue ? (
                      <Badge variant="destructive" className="text-[10px]"><AlertCircle className="h-3 w-3 mr-1" />Atrasado</Badge>
                    ) : (
                      <StatusBadge variant={t.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => togglePaid(t)} title={t.status === "paid" ? "Marcar pendente" : "Marcar pago"}>
                        <CheckCircle2 className={`h-3.5 w-3.5 ${t.status === "paid" ? "text-success" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deleteTransaction(t.id); toast.success("Excluído!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const filterBar = (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="paid">Pago</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="overdue">Atrasado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Recebimentos, pagamentos, comissões e fluxo de caixa</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button onClick={() => openNew()}><Plus className="mr-2 h-4 w-4" /> Novo Registro</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingTx ? "Editar Registro" : "Novo Registro Financeiro"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
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
                  <Label>Categoria</Label>
                  <Select value={form.category || "__none__"} onValueChange={(v) => setForm({ ...form, category: v === "__none__" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma</SelectItem>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="commission">Comissão</SelectItem>
                      <SelectItem value="supplier">Fornecedor</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ops">Operacional</SelectItem>
                      <SelectItem value="tax">Imposto/Taxa</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                <div><Label>Data *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Cliente</Label>
                  <Select value={form.clientId || "__none__"} onValueChange={(v) => setForm({ ...form, clientId: v === "__none__" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum</SelectItem>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Viagem</Label>
                  <Select value={form.packageId || "__none__"} onValueChange={(v) => setForm({ ...form, packageId: v === "__none__" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma</SelectItem>
                      {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Receitas (mês)" value={brl(monthIncome)} icon={TrendingUp} variant="success" />
        <StatCard title="Despesas (mês)" value={brl(monthExpense)} icon={TrendingDown} variant="warning" />
        <StatCard title="Lucro (mês)" value={brl(monthProfit)} icon={DollarSign} variant={monthProfit >= 0 ? "info" : "default"} />
        <StatCard title="A receber atrasado" value={brl(overdueValue)} icon={AlertCircle} variant={overdueValue > 0 ? "warning" : "default"} />
        <StatCard title="Comissões pendentes" value={brl(commissionPending)} icon={Percent} variant="info" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="income">Recebimentos</TabsTrigger>
          <TabsTrigger value="expense">Pagamentos</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Receitas vs Despesas (últimos 6 meses)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="receitas" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="despesas" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Próximos recebimentos</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {transactions.filter((t) => t.type === "income" && t.status === "pending").slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(t.date)} · {t.clientName ?? "—"}</div>
                    </div>
                    <div className={`font-semibold tabular-nums ${isOverdue(t) ? "text-destructive" : "text-success"}`}>{brl(t.value)}</div>
                  </div>
                ))}
                {transactions.filter((t) => t.type === "income" && t.status === "pending").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nada pendente 🎉</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Próximos pagamentos</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {transactions.filter((t) => t.type === "expense" && t.status === "pending").slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(t.date)} · {t.category ?? "—"}</div>
                    </div>
                    <div className={`font-semibold tabular-nums ${isOverdue(t) ? "text-destructive" : ""}`}>{brl(t.value)}</div>
                  </div>
                ))}
                {transactions.filter((t) => t.type === "expense" && t.status === "pending").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nada pendente</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-6">
          {filterBar}
          {renderTable(filterFor("income"))}
        </TabsContent>

        <TabsContent value="expense" className="space-y-4 mt-6">
          {filterBar}
          {renderTable(filterFor("expense"))}
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Comissões por viagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma viagem com comissão configurada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Viagem</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden md:table-cell">Cliente</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Valor base</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">%</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Esperado</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Recebido</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Pendente</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.packageId} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{c.packageName}</td>
                          <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{c.clientName || "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{brl(c.totalValue)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{c.percent}%</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold">{brl(c.expected)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-success">{brl(c.received)}</td>
                          <td className={`px-3 py-2 text-right tabular-nums font-semibold ${c.pending > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{brl(c.pending)}</td>
                          <td className="px-3 py-2 text-right">
                            {c.fullyReceived ? (
                              <Badge variant="secondary" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />Recebida</Badge>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => openNew({
                                type: "income", category: "commission",
                                description: `Comissão ${c.packageName}`,
                                value: String(c.pending.toFixed(2)),
                                packageId: c.packageId,
                                clientId: packages.find((p) => p.id === c.packageId)?.clientId ?? "",
                                status: "paid",
                              })}>Registrar</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;

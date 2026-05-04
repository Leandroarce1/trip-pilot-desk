import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Eye, Edit2, Trash2, Plane, Calendar as CalendarIcon,
  TrendingUp, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Package as PackageIcon, X,
  User as UserIcon, FileText, Ticket, DollarSign, Flame, Sparkles,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { TravelPackage, ReservationStatus, TripType, Passenger, Opportunity, Quote } from "@/types/crm";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SalesJourney } from "@/components/SalesJourney";
import { FileText as FileTextIcon } from "lucide-react";

// ------- Status helpers -------
const reservationStatusLabels: Record<ReservationStatus, string> = {
  quoting: "Em cotação",
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const reservationStatusBadge: Record<ReservationStatus, string> = {
  quoting: "bg-info-soft text-info-soft-foreground",
  pending: "bg-warning-soft text-warning-soft-foreground",
  confirmed: "bg-success-soft text-success-soft-foreground",
  cancelled: "bg-error-soft text-error-soft-foreground",
};

// Derived operational status for the agent panel
type OpStatus = "awaiting_payment" | "confirmed" | "issued" | "traveling" | "completed" | "cancelled" | "quoting";

const opStatusMeta: Record<OpStatus, { label: string; cls: string }> = {
  quoting:          { label: "Em cotação",        cls: "bg-info-soft text-info-soft-foreground" },
  awaiting_payment: { label: "Aguardando pgto.",  cls: "bg-warning-soft text-warning-soft-foreground" },
  confirmed:        { label: "Confirmada",        cls: "bg-success-soft text-success-soft-foreground" },
  issued:           { label: "Emitida",           cls: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--navy))]" },
  traveling:        { label: "Em viagem",         cls: "bg-primary/15 text-primary" },
  completed:        { label: "Concluída",         cls: "bg-secondary text-secondary-foreground" },
  cancelled:        { label: "Cancelada",         cls: "bg-error-soft text-error-soft-foreground" },
};

const daysUntil = (iso: string) => {
  if (!iso) return Infinity;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso); d.setHours(0,0,0,0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

const computeOpStatus = (p: TravelPackage, hasVoucher: boolean): OpStatus => {
  if (p.reservationStatus === "cancelled") return "cancelled";
  if (p.reservationStatus === "quoting") return "quoting";
  const dDep = daysUntil(p.departureDate);
  const dRet = daysUntil(p.returnDate);
  if (dRet < 0) return "completed";
  if (dDep <= 0 && dRet >= 0) return "traveling";
  if (p.paymentStatus !== "paid") return "awaiting_payment";
  if (hasVoucher) return "issued";
  return "confirmed";
};

const computeNextAction = (p: TravelPackage, op: OpStatus, hasVoucher: boolean): { label: string; tone: "warning" | "primary" | "success" | "muted" } | null => {
  if (op === "cancelled" || op === "completed") return null;
  if (op === "quoting") return { label: "Confirmar reserva", tone: "primary" };
  if (op === "awaiting_payment") return { label: "Cobrar cliente", tone: "warning" };
  if (op === "confirmed" && !hasVoucher) return { label: "Gerar voucher", tone: "primary" };
  if (op === "issued") {
    const d = daysUntil(p.departureDate);
    if (d <= 3 && d >= 0) return { label: "Enviar check-in", tone: "warning" };
    return { label: "Acompanhar viagem", tone: "muted" };
  }
  if (op === "traveling") return { label: "Acompanhar viagem", tone: "success" };
  return null;
};

const filterPills: Array<{ key: "all" | OpStatus; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "awaiting_payment", label: "Aguardando pgto." },
  { key: "confirmed", label: "Confirmadas" },
  { key: "issued", label: "Emitidas" },
  { key: "traveling", label: "Em viagem" },
  { key: "completed", label: "Concluídas" },
  { key: "quoting", label: "Em cotação" },
  { key: "cancelled", label: "Canceladas" },
];

const tripTypeLabels: Record<TripType, string> = {
  air: "Aéreo",
  package: "Pacote completo",
  cruise: "Cruzeiro",
  road: "Rodoviário",
  hotel: "Hotel",
};

// ------- Sorting -------
type SortKey =
  | "clientName" | "destinationCity" | "departureDate" | "returnDate"
  | "supplier" | "totalValue" | "commission" | "reservationStatus";
type SortDir = "asc" | "desc";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// ------- Empty form -------
type FormState = {
  clientId: string;
  destinationCity: string;
  destinationCountry: string;
  destinationFlag: string;
  departureDate: string;
  returnDate: string;
  tripType: TripType;
  supplierId: string;
  supplier: string;
  confirmationCode: string;
  locator: string;
  supplierDeadline: string;
  totalValue: string;
  commissionPercent: string;
  passengersCount: string;
  notes: string;
  reservationStatus: ReservationStatus;
};

const emptyForm: FormState = {
  clientId: "",
  destinationCity: "",
  destinationCountry: "",
  destinationFlag: "",
  departureDate: "",
  returnDate: "",
  tripType: "package",
  supplierId: "",
  supplier: "",
  confirmationCode: "",
  locator: "",
  supplierDeadline: "",
  totalValue: "",
  commissionPercent: "10",
  passengersCount: "1",
  notes: "",
  reservationStatus: "quoting",
};

const Packages = () => {
  const navigate = useNavigate();
  const { packages, clients, suppliers, addPackage, updatePackage, deletePackage, addTransaction, quotes, opportunities, vouchers } = useData();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | OpStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("departureDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TravelPackage | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const hasVoucherFor = (pkgId: string) => vouchers.some((v) => v.packageId === pkgId && v.issued);

  // ------- Filtering + sorting -------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return packages.filter((p) => {
      const matchesSearch =
        !q ||
        p.clientName.toLowerCase().includes(q) ||
        p.destinationCity.toLowerCase().includes(q) ||
        p.destinationCountry.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q);
      const op = computeOpStatus(p, hasVoucherFor(p.id));
      const matchesFilter = filter === "all" || op === filter;
      return matchesSearch && matchesFilter;
    });
  }, [packages, search, filter, vouchers]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortKey) {
        case "clientName": av = a.clientName; bv = b.clientName; break;
        case "destinationCity": av = a.destinationCity; bv = b.destinationCity; break;
        case "departureDate": av = a.departureDate; bv = b.departureDate; break;
        case "returnDate": av = a.returnDate; bv = b.returnDate; break;
        case "supplier": av = a.supplier; bv = b.supplier; break;
        case "totalValue": av = a.totalValue; bv = b.totalValue; break;
        case "commission":
          av = (a.totalValue * a.commissionPercent) / 100;
          bv = (b.totalValue * b.commissionPercent) / 100;
          break;
        case "reservationStatus": av = a.reservationStatus; bv = b.reservationStatus; break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // ------- Pagination -------
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  // ------- Metrics -------
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const activeReservations = packages.filter((p) => p.reservationStatus !== "cancelled").length;
  const tripsThisMonth = packages.filter((p) => p.departureDate.startsWith(currentMonth)).length;
  const monthCommission = packages
    .filter((p) => p.departureDate.startsWith(currentMonth) && p.reservationStatus !== "cancelled")
    .reduce((s, p) => s + (p.totalValue * p.commissionPercent) / 100, 0);
  const pendingActions = packages.filter(
    (p) => p.reservationStatus === "pending" || p.reservationStatus === "quoting",
  ).length;

  const metrics = [
    { label: "Reservas ativas", value: activeReservations, icon: PackageIcon, tone: "primary" as const },
    { label: "Viagens este mês", value: tripsThisMonth, icon: Plane, tone: "navy" as const },
    { label: "Comissões do mês", value: fmtCurrency(monthCommission), icon: TrendingUp, tone: "success" as const },
    { label: "Pendentes de ação", value: pendingActions, icon: AlertCircle, tone: "warning" as const },
  ];

  // ------- Form handlers -------
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptyForm); }
  };

  const openEdit = (p: TravelPackage) => {
    setEditing(p);
    setForm({
      clientId: p.clientId,
      destinationCity: p.destinationCity,
      destinationCountry: p.destinationCountry,
      destinationFlag: p.destinationFlag || "",
      departureDate: p.departureDate,
      returnDate: p.returnDate,
      tripType: p.tripType,
      supplierId: p.supplierId || "",
      supplier: p.supplier,
      confirmationCode: p.confirmationCode || "",
      locator: p.locator || "",
      supplierDeadline: p.supplierDeadline || "",
      totalValue: String(p.totalValue),
      commissionPercent: String(p.commissionPercent),
      passengersCount: String(Math.max(1, p.passengers.length)),
      notes: p.notes,
      reservationStatus: p.reservationStatus,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.clientId || !form.destinationCity || !form.departureDate || !form.returnDate) {
      toast.error("Preencha cliente, destino e datas");
      return;
    }
    const totalValue = Number(form.totalValue) || 0;
    const commissionPercent = Number(form.commissionPercent) || 0;
    const count = Math.max(1, Number(form.passengersCount) || 1);
    const client = clients.find((c) => c.id === form.clientId);
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    const supplierName = supplier?.name || form.supplier;

    // Build passenger list (preserving existing names when editing)
    const existing = editing?.passengers ?? [];
    const passengers: Passenger[] = Array.from({ length: count }, (_, i) =>
      existing[i] ?? { name: i === 0 ? client?.name || `Passageiro ${i + 1}` : `Passageiro ${i + 1}` },
    );

    const baseName = `${form.destinationCity} – ${client?.name ?? ""}`.trim();

    if (editing) {
      await updatePackage({
        ...editing,
        clientId: form.clientId,
        clientName: client?.name || editing.clientName,
        destinationCity: form.destinationCity,
        destinationCountry: form.destinationCountry,
        destinationFlag: form.destinationFlag,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        tripType: form.tripType,
        supplierId: form.supplierId || undefined,
        supplier: supplierName,
        confirmationCode: form.confirmationCode,
        locator: form.locator,
        supplierDeadline: form.supplierDeadline || undefined,
        totalValue,
        commissionPercent,
        passengers,
        reservationStatus: form.reservationStatus,
        notes: form.notes,
        history: [
          ...editing.history,
          { date: new Date().toISOString(), action: "Reserva atualizada" },
        ],
      });
      toast.success("Reserva atualizada");
    } else {
      await addPackage({
        name: baseName || "Nova reserva",
        clientId: form.clientId,
        destinationCity: form.destinationCity,
        destinationCountry: form.destinationCountry,
        destinationFlag: form.destinationFlag,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        tripType: form.tripType,
        supplierId: form.supplierId || undefined,
        supplier: supplierName,
        confirmationCode: form.confirmationCode,
        locator: form.locator,
        supplierDeadline: form.supplierDeadline || undefined,
        totalValue,
        commissionPercent,
        passengers,
        reservationStatus: form.reservationStatus,
        paymentStatus: "pending",
        flightIds: [],
        transactionIds: [],
        documents: [],
        history: [{ date: new Date().toISOString(), action: "Reserva criada" }],
        notes: form.notes,
      });
      // Auto-generate income transaction (pending) for the client
      if (totalValue > 0) {
        try {
          await addTransaction({
            type: "income",
            description: `Venda: ${baseName || "Reserva"}`,
            value: totalValue,
            date: form.departureDate || new Date().toISOString().slice(0, 10),
            status: "pending",
            category: "sale",
            clientId: form.clientId,
            clientName: client?.name,
          });
        } catch { /* non-fatal */ }
      }
      toast.success("Reserva criada", { description: totalValue > 0 ? "Receita lançada no Financeiro." : undefined });
    }
    handleOpenChange(false);
  };

  // ------- Sortable header cell -------
  const SortHead = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => {
    const active = sortKey === k;
    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <TableHead className={cn("cursor-pointer select-none", className)} onClick={() => toggleSort(k)}>
        <span className="inline-flex items-center gap-1.5">
          {label}
          <Icon className={cn("h-3 w-3", active ? "text-primary" : "text-muted-foreground/50")} />
        </span>
      </TableHead>
    );
  };

  const commissionValue = Number(form.totalValue || 0) * (Number(form.commissionPercent || 0) / 100);

  return (
    <div className="space-y-6">
      <SalesJourney current="reservation" completed={["lead", "opportunity", "proposal"]} />

      {/* ---------- Page header ---------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-caption mb-1">Operação</p>
          <h1 className="text-3xl tracking-tight">Reservas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeReservations} reserva{activeReservations === 1 ? "" : "s"} ativa{activeReservations === 1 ? "" : "s"} no momento
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Nova reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar reserva" : "Nova reserva"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="label-caption">Cliente</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="label-caption">Cidade</Label>
                <Input className="mt-1.5" value={form.destinationCity} onChange={(e) => setForm({ ...form, destinationCity: e.target.value })} placeholder="Ex: Cancún" />
              </div>
              <div>
                <Label className="label-caption">País</Label>
                <Input className="mt-1.5" value={form.destinationCountry} onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })} placeholder="Ex: México" />
              </div>
              <div>
                <Label className="label-caption">Bandeira (emoji)</Label>
                <Input className="mt-1.5" value={form.destinationFlag} onChange={(e) => setForm({ ...form, destinationFlag: e.target.value })} placeholder="🇲🇽" />
              </div>
              <div>
                <Label className="label-caption">Tipo de viagem</Label>
                <Select value={form.tripType} onValueChange={(v) => setForm({ ...form, tripType: v as TripType })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(tripTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="label-caption">Data de embarque</Label>
                <Input className="mt-1.5" type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Data de retorno</Label>
                <Input className="mt-1.5" type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
              </div>

              <div>
                <Label className="label-caption">Fornecedor</Label>
                <Select
                  value={form.supplierId || "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") { setForm({ ...form, supplierId: "", supplier: "" }); return; }
                    const s = suppliers.find((x) => x.id === v);
                    setForm({
                      ...form,
                      supplierId: v,
                      supplier: s?.name ?? "",
                      commissionPercent: s?.defaultCommission ? String(s.defaultCommission) : form.commissionPercent,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Nenhum / Avulso —</SelectItem>
                    {suppliers.filter((s) => s.active).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!form.supplierId && (
                  <Input
                    className="mt-2"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="Ou digite o nome (avulso)"
                  />
                )}
              </div>
              <div>
                <Label className="label-caption">Localizador / PNR *</Label>
                <Input className="mt-1.5 font-mono" value={form.locator} onChange={(e) => setForm({ ...form, locator: e.target.value })} placeholder="ABC123" />
              </div>
              <div>
                <Label className="label-caption">Código de confirmação</Label>
                <Input className="mt-1.5 font-mono" value={form.confirmationCode} onChange={(e) => setForm({ ...form, confirmationCode: e.target.value })} placeholder="opcional" />
              </div>
              <div>
                <Label className="label-caption">Prazo de pagamento ao fornecedor</Label>
                <Input className="mt-1.5" type="date" value={form.supplierDeadline} onChange={(e) => setForm({ ...form, supplierDeadline: e.target.value })} />
              </div>

              <div>
                <Label className="label-caption">Valor total (R$)</Label>
                <Input className="mt-1.5" type="number" min="0" value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label className="label-caption">Comissão (%)</Label>
                <Input className="mt-1.5" type="number" min="0" max="100" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} placeholder="10" />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ≈ <span className="font-mono text-primary">{fmtCurrency(commissionValue)}</span>
                </p>
              </div>

              <div>
                <Label className="label-caption">Nº de passageiros</Label>
                <Input className="mt-1.5" type="number" min="1" value={form.passengersCount} onChange={(e) => setForm({ ...form, passengersCount: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Status</Label>
                <Select value={form.reservationStatus} onValueChange={(v) => setForm({ ...form, reservationStatus: v as ReservationStatus })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quoting">Em cotação</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label className="label-caption">Observações</Label>
                <Textarea className="mt-1.5" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>

            <DialogFooter className="mt-2 gap-2">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSubmit}>{editing ? "Salvar alterações" : "Salvar reserva"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ---------- Metric cards ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "rounded-lg p-2",
                    m.tone === "primary" && "bg-secondary text-primary",
                    m.tone === "navy" && "bg-navy/5 text-navy",
                    m.tone === "success" && "bg-success-soft text-success-soft-foreground",
                    m.tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                  )}
                >
                  <m.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[28px] font-bold tracking-tight text-navy leading-none">{m.value}</p>
              <p className="label-caption mt-3">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------- Search + filter pills ---------- */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou destino..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {filterPills.map((pill) => {
              const active = filter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => { setFilter(pill.key); setPage(1); }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Table ---------- */}
      <TooltipProvider delayDuration={200}>
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead k="clientName" label="Cliente / Origem" />
                <SortHead k="destinationCity" label="Destino" />
                <SortHead k="departureDate" label="Embarque" />
                <SortHead k="supplier" label="Fornecedor" />
                <SortHead k="totalValue" label="Total" className="text-right" />
                <SortHead k="commission" label="Comissão" className="text-right" />
                <SortHead k="reservationStatus" label="Status" />
                <TableHead>Próxima ação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">
                    Nenhuma reserva encontrada
                  </TableCell>
                </TableRow>
              )}
              {pageItems.map((p) => {
                const commission = (p.totalValue * p.commissionPercent) / 100;
                const hasVoucher = hasVoucherFor(p.id);
                const op = computeOpStatus(p, hasVoucher);
                const next = computeNextAction(p, op, hasVoucher);
                const dDep = daysUntil(p.departureDate);
                const dDeadline = p.supplierDeadline ? daysUntil(p.supplierDeadline) : null;
                const deadlineSoon = dDeadline !== null && dDeadline <= 7 && dDeadline >= 0 && p.paymentStatus !== "paid";
                const deadlineLate = dDeadline !== null && dDeadline < 0 && p.paymentStatus !== "paid";
                const urgent = (op === "awaiting_payment" && dDep <= 14) || (op === "confirmed" && !hasVoucher && dDep <= 7) || (op === "issued" && dDep <= 3 && dDep >= 0) || deadlineSoon || deadlineLate;
                const linkedQuote: Quote | undefined = p.quoteId ? quotes.find((q) => q.id === p.quoteId) : undefined;
                const linkedOpp: Opportunity | undefined = linkedQuote?.opportunityId
                  ? opportunities.find((o) => o.id === linkedQuote.opportunityId)
                  : opportunities.find((o) => o.clientId === p.clientId);

                const nextToneCls =
                  next?.tone === "warning" ? "bg-warning text-white hover:bg-warning/90"
                  : next?.tone === "success" ? "bg-success text-white hover:bg-success/90"
                  : next?.tone === "muted" ? "bg-muted text-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover";

                const handleNextAction = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (!next) return;
                  if (next.label === "Cobrar cliente") navigate("/financeiro?tab=transactions");
                  else if (next.label === "Gerar voucher") navigate("/vouchers");
                  else if (next.label === "Confirmar reserva") openEdit(p);
                  else navigate(`/pacotes/${p.id}`);
                };

                return (
                  <TableRow
                    key={p.id}
                    className={cn("cursor-pointer", urgent && "bg-warning/[0.04]")}
                    onClick={() => navigate(`/pacotes/${p.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-primary">
                          {initials(p.clientName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-navy truncate">{p.clientName}</p>
                            {urgent && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Flame className="h-3.5 w-3.5 text-warning" />
                                </TooltipTrigger>
                                <TooltipContent>Reserva urgente</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{p.name}</p>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            {linkedOpp && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-info-soft text-info-soft-foreground px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider">
                                <Sparkles className="h-2.5 w-2.5" /> Oport.
                              </span>
                            )}
                            {linkedQuote && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider">
                                <FileText className="h-2.5 w-2.5" /> Proposta
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="mr-1">{p.destinationFlag}</span>
                        <span className="font-medium">{p.destinationCity}</span>
                        <span className="text-muted-foreground">, {p.destinationCountry}</span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground tabular-nums">
                        {fmtDate(p.departureDate)} → {fmtDate(p.returnDate)}
                      </p>
                      {p.locator && (
                        <p className="text-[10.5px] font-mono text-primary mt-0.5">
                          PNR: {p.locator}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {fmtDate(p.departureDate)}
                      {dDep >= 0 && dDep <= 30 && (
                        <p className={cn("text-[10px]", urgent ? "text-warning font-semibold" : "text-muted-foreground")}>
                          em {dDep}d
                        </p>
                      )}
                      {p.supplierDeadline && p.paymentStatus !== "paid" && (
                        <p className={cn(
                          "text-[10px] font-semibold mt-0.5 inline-flex items-center gap-0.5",
                          deadlineLate ? "text-destructive" : deadlineSoon ? "text-warning" : "text-muted-foreground"
                        )}>
                          {(deadlineLate || deadlineSoon) && <AlertCircle className="h-2.5 w-2.5" />}
                          Pgto forn: {fmtDate(p.supplierDeadline)}
                          {deadlineLate ? ` (atrasado ${Math.abs(dDeadline!)}d)` : deadlineSoon ? ` (${dDeadline}d)` : ""}
                        </p>
                      )}
                    </TableCell>
                        <p className={cn("text-[10px]", urgent ? "text-warning font-semibold" : "text-muted-foreground")}>
                          em {dDep}d
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{p.supplier || "—"}</TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums text-navy">
                      {fmtCurrency(p.totalValue)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono text-primary tabular-nums">
                      {fmtCurrency(commission)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
                          opStatusMeta[op].cls,
                        )}
                      >
                        {opStatusMeta[op].label}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {next ? (
                        <Button size="sm" className={cn("h-7 px-2.5 text-[11px]", nextToneCls)} onClick={handleNextAction}>
                          {next.label}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/pacotes/${p.id}`)} aria-label="Abrir reserva">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Abrir reserva</TooltipContent>
                        </Tooltip>
                        {linkedQuote && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/cotacoes?id=${linkedQuote.id}`)} aria-label="Ver proposta">
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver proposta</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/clientes/${p.clientId}`)} aria-label="Ver cliente">
                              <UserIcon className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver cliente</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => navigate("/vouchers")} aria-label="Voucher">
                              <Ticket className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{hasVoucher ? "Ver voucher" : "Gerar voucher"}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => navigate("/financeiro?tab=transactions")} aria-label="Financeiro">
                              <DollarSign className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Abrir financeiro</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Editar">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Excluir">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => { deletePackage(p.id); toast.success("Reserva excluída"); }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </TooltipProvider>

      {/* ---------- Pagination ---------- */}
      {sorted.length > 0 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{(safePage - 1) * PAGE_SIZE + 1}</span>–
            <span className="font-semibold text-foreground">{Math.min(safePage * PAGE_SIZE, sorted.length)}</span> de{" "}
            <span className="font-semibold text-foreground">{sorted.length}</span> reservas
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </Button>
            <div className="px-2 text-xs tabular-nums text-muted-foreground">
              Página <span className="font-semibold text-foreground">{safePage}</span> de{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Próxima <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* spacer + nav back */}
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <CalendarIcon className="h-3.5 w-3.5" /> Ver agenda
        </Button>
      </div>
    </div>
  );
};

export default Packages;

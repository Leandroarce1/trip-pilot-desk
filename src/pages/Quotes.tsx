import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Eye, MapPin, Calendar as CalendarIcon, CheckCircle2, Package as PackageIcon, X, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/contexts/DataContext";
import { Quote, ItineraryDay, QuoteItem, QuoteStatus } from "@/types/crm";
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
import { BackButton } from "@/components/BackButton";

const emptyForm = { clientId: "", destination: "", startDate: "", endDate: "", value: "", description: "", status: "draft" as QuoteStatus, marginPercent: "20" };
const emptyDay: ItineraryDay = { day: 1, title: "", description: "" };
const newItem = (category: QuoteItem["category"] = "other", description = ""): QuoteItem => ({ id: crypto.randomUUID(), description, quantity: 1, unitValue: 0, cost: 0, category, date: "", commissionPercent: 10 });

const CATEGORY_LABEL: Record<string, string> = {
  flight: "✈️ Aéreo", hotel: "🏨 Hotel", transfer: "🚐 Translado",
  tour: "🗺️ Passeio", insurance: "🛡️ Seguro", other: "📦 Outro",
};

const Quotes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { quotes, clients, packages, addQuote, updateQuote, deleteQuote, addPackage, updateClient, travelers, addTransaction } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const initRef = useRef(false);
  const fromParam = searchParams.get("from");
  const editParam = searchParams.get("edit") || searchParams.get("id");

  // Track dirty
  useEffect(() => { if (open) setDirty(true); }, [form, itinerary, items]);
  useEffect(() => { if (!open) setDirty(false); }, [open]);

  const filtered = quotes.filter((q) => {
    const matchSearch = q.clientName.toLowerCase().includes(search.toLowerCase()) || q.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Cálculos automáticos a partir dos itens
  const itemsTotal = items.reduce((acc, it) => acc + it.quantity * it.unitValue, 0);
  const itemsCost = items.reduce((acc, it) => acc + it.quantity * (it.cost ?? 0), 0);
  const airfareValue = Number(form.value) || 0;
  const effectiveValue = itemsTotal + airfareValue;
  const computedMargin = effectiveValue > 0 ? ((effectiveValue - itemsCost) / effectiveValue) * 100 : Number(form.marginPercent) || 0;

  const handleSubmit = (opts?: { keepOpen?: boolean }) => {
    if (!form.clientId || !form.destination) { toast.error("Preencha cliente e destino"); return; }
    if (effectiveValue <= 0) { toast.error("Adicione itens ou informe um valor"); return; }
    const cleanItinerary = itinerary.filter((d) => d.title.trim() !== "");
    const cleanItems = items.filter((i) => i.description.trim() !== "");
    const payload = {
      clientId: form.clientId,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      value: effectiveValue,
      description: form.description,
      status: form.status,
      marginPercent: cleanItems.length > 0 ? Number(computedMargin.toFixed(2)) : Number(form.marginPercent) || 0,
      itinerary: cleanItinerary.length > 0 ? cleanItinerary : undefined,
      items: cleanItems.length > 0 ? cleanItems : undefined,
    };
    if (editingQuote) {
      updateQuote({ ...editingQuote, ...payload, clientName: clients.find((c) => c.id === form.clientId)?.name || "" });
      toast.success("Proposta atualizada!");
    } else {
      addQuote(payload);
      toast.success("Proposta criada!");
    }
    setDirty(false);
    if (opts?.keepOpen) return;
    setForm(emptyForm);
    setItinerary([]);
    setItems([]);
    setEditingQuote(null);
    setOpen(false);
    if (fromParam) {
      setSearchParams({});
      navigate(`/${fromParam}`);
    }
  };

  const openEdit = (q: Quote) => {
    setEditingQuote(q);
    setForm({
      clientId: q.clientId, destination: q.destination, startDate: q.startDate, endDate: q.endDate,
      value: String(q.value), description: q.description, status: q.status,
      marginPercent: String(q.marginPercent ?? 20),
    });
    setItinerary(q.itinerary || []);
    setItems(q.items || []);
    setOpen(true);
    setTimeout(() => setDirty(false), 0);
  };

  const requestClose = () => {
    if (dirty && !window.confirm("Você tem alterações não salvas. Deseja descartar?")) return;
    setOpen(false);
    setEditingQuote(null);
    setForm(emptyForm);
    setItinerary([]);
    setItems([]);
    setDirty(false);
    if (fromParam) { setSearchParams({}); }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) { requestClose(); return; }
    setOpen(true);
  };

  // Auto-open editor when arriving with ?edit=ID
  useEffect(() => {
    if (initRef.current) return;
    if (editParam && quotes.length > 0) {
      const q = quotes.find((x) => x.id === editParam);
      if (q) { openEdit(q); initRef.current = true; return; }
    }
    // Pré-preenchimento a partir de cliente (vindo de /clientes)
    const clientParam = searchParams.get("client");
    if (clientParam && clients.length > 0 && !editParam) {
      const c = clients.find((x) => x.id === clientParam);
      if (c) {
        // Tenta pegar dados de uma oportunidade vinculada
        setForm((prev) => ({ ...prev, clientId: c.id }));
        setOpen(true);
        initRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editParam, quotes, clients, searchParams]);

  const addItem = (category: QuoteItem["category"] = "other", description = "") =>
    setItems((prev) => [...prev, newItem(category, description)]);
  const updateItem = (id: string, patch: Partial<QuoteItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const sendToClient = async (q: Quote) => {
    const client = clients.find((c) => c.id === q.clientId);
    const url = `${window.location.origin}/reserva/${q.id}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    if (q.status === "draft") await updateQuote({ ...q, status: "sent" });
    const phone = (client?.phone || "").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá ${client?.name || ""}! Segue sua proposta para ${q.destination}: ${url}`
    );
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      toast.success("Link copiado e WhatsApp aberto");
    } else {
      toast.success("Link da proposta copiado", { description: "Cole onde quiser enviar." });
    }
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

  /** Aprova proposta + cria reserva + promove cliente para 'sold' + gera contas a pagar */
  const approveAndGenerateReservation = async (q: Quote) => {
    const client = clients.find((c) => c.id === q.clientId);
    if (!client) { toast.error("Cliente não encontrado"); return; }

    // 1) Marca proposta como aprovada
    await updateQuote({ ...q, status: "approved" });

    // 2) Promove cliente para 'sold'
    if (client.status === "lead" || client.status === "negotiation") {
      await updateClient({ ...client, status: "sold" });
    }

    // 3) Monta lista de passageiros (cliente + viajantes vinculados)
    const linkedTravelers = travelers.filter((t) => t.clientId === client.id);
    const passengers = [
      { name: client.name, document: client.document },
      ...linkedTravelers.map((t) => ({ name: t.name, document: t.document ?? "" })),
    ];

    // 4) Cria reserva vinculada
    const today = new Date().toISOString().slice(0, 10);
    await addPackage({
      name: `Viagem para ${q.destination}`,
      clientId: q.clientId,
      destinationCity: q.destination.split(",")[0]?.trim() || q.destination,
      destinationCountry: q.destination.split(",").slice(1).join(",").trim() || "—",
      destinationFlag: "🌍",
      departureDate: q.startDate || today,
      returnDate: q.endDate || today,
      tripType: "package",
      supplier: "",
      confirmationCode: "",
      totalValue: q.value,
      commissionPercent: q.marginPercent ?? 10,
      passengers,
      reservationStatus: "pending",
      paymentStatus: "pending",
      quoteId: q.id,
      flightIds: [],
      transactionIds: [],
      documents: [],
      history: [
        { date: new Date().toISOString(), action: `Reserva gerada a partir da proposta #${q.id}` },
      ],
      notes: q.description,
    });

    // 5) Gera contas a pagar para cada item da proposta com custo > 0
    let payableCount = 0;
    for (const item of (q.items ?? [])) {
      const totalCost = (item.cost ?? 0) * item.quantity;
      if (totalCost <= 0) continue;
      try {
        await addTransaction({
          type: "expense",
          description: `${CATEGORY_LABEL[item.category ?? "other"] ?? "Item"} — ${item.description} (${client.name})`,
          value: totalCost,
          date: item.date || q.startDate || today,
          status: "pending",
          category: "supplier_payable",
          clientName: client.name,
          clientId: client.id,
        });
        payableCount++;
      } catch (e) {
        console.warn("Falha ao gerar conta a pagar:", e);
      }
    }

    toast.success("Proposta aprovada — reserva criada", {
      description: `${passengers.length} passageiro(s) · ${payableCount} conta(s) a pagar gerada(s).`,
      action: { label: "Ver reservas", onClick: () => navigate("/pacotes") },
    });
  };

  // Próxima proposta a aprovar (mais antiga enviada)
  const nextToApprove = quotes
    .filter((q) => q.status === "sent")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];

  return (
    <div className="space-y-6">
      {fromParam ? (
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => { setSearchParams({}); navigate(`/${fromParam}`); }}>
          <ArrowLeft className="h-4 w-4" /> Voltar para {fromParam === "oportunidades" ? "Oportunidades" : fromParam}
        </Button>
      ) : (
        <BackButton fallback="/" />
      )}
      <SalesJourney current="proposal" completed={["lead", "opportunity"]} />

      {nextToApprove && (
        <NextStepBanner
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title={`Aprovar proposta de ${nextToApprove.clientName}`}
          description={`${nextToApprove.destination} · R$ ${nextToApprove.value.toLocaleString("pt-BR")} → gera reserva automaticamente`}
          actionLabel="Aprovar e gerar reserva"
          onAction={() => approveAndGenerateReservation(nextToApprove)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propostas</h1>
          <p className="text-sm text-muted-foreground">{quotes.length} proposta(s)</p>
        </div>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nova Proposta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingQuote ? "Editar Proposta" : "Nova Proposta"}</DialogTitle></DialogHeader>
            <Tabs defaultValue="info" className="pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
                <TabsTrigger value="items" className="flex-1">Itens</TabsTrigger>
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Aéreo (R$)</Label>
                    <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" />
                    {items.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                        + Itens R$ {itemsTotal.toLocaleString("pt-BR")} = <span className="font-semibold text-primary">R$ {effectiveValue.toLocaleString("pt-BR")}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Margem (%){items.length > 0 && <span className="text-[10px] text-muted-foreground ml-1">(auto)</span>}</Label>
                    <Input type="number" value={items.length > 0 ? computedMargin.toFixed(1) : form.marginPercent} onChange={(e) => setForm({ ...form, marginPercent: e.target.value })} disabled={items.length > 0} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as QuoteStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="approved">Aprovada</SelectItem>
                        <SelectItem value="lost">Perdida</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descrição do pacote</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </TabsContent>
              <TabsContent value="items" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">Detalhe os itens da proposta. O valor total e a margem são calculados automaticamente.</p>
                {items.map((it) => {
                  const subtotal = it.quantity * it.unitValue;
                  const itemCommission = subtotal * ((it.commissionPercent ?? 0) / 100);
                  return (
                    <div key={it.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Select value={it.category ?? "other"} onValueChange={(v) => updateItem(it.id, { category: v as any })}>
                          <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Descrição (ex: Hotel 5 noites)" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} className="flex-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeItem(it.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <Label className="text-[10px]">Data</Label>
                          <Input type="date" value={it.date ?? ""} onChange={(e) => updateItem(it.id, { date: e.target.value })} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Qtd</Label>
                          <Input type="number" value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Valor unit.</Label>
                          <Input type="number" value={it.unitValue} onChange={(e) => updateItem(it.id, { unitValue: Number(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Custo unit.</Label>
                          <Input type="number" value={it.cost ?? 0} onChange={(e) => updateItem(it.id, { cost: Number(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label className="text-[10px]">Comissão %</Label>
                          <Input type="number" value={it.commissionPercent ?? 0} onChange={(e) => updateItem(it.id, { commissionPercent: Number(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                        <span>Comissão: <span className="font-semibold text-success">R$ {itemCommission.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span></span>
                        <span>Subtotal: <span className="font-semibold text-foreground">R$ {subtotal.toLocaleString("pt-BR")}</span></span>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />Adicionar item
                </Button>
                {(items.length > 0 || airfareValue > 0) && (
                  <div className="rounded-lg bg-muted/50 p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Aéreo</p>
                      <p className="font-bold tabular-nums">R$ {airfareValue.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Itens</p>
                      <p className="font-bold tabular-nums">R$ {itemsTotal.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Total</p>
                      <p className="font-bold tabular-nums text-primary">R$ {effectiveValue.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Margem</p>
                      <p className="font-bold tabular-nums text-success">{computedMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
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
            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t">
              <Button variant="ghost" className="sm:w-auto" onClick={requestClose}>Cancelar</Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => handleSubmit({ keepOpen: true })}>Salvar</Button>
              <Button onClick={() => handleSubmit()}>{editingQuote ? "Salvar e voltar" : "Criar e voltar"}</Button>
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
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="approved">Aprovada</SelectItem>
            <SelectItem value="lost">Perdida</SelectItem>
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
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground tabular-nums">R$ {q.value.toLocaleString("pt-BR")}</p>
                  {q.marginPercent !== undefined && q.marginPercent > 0 && (
                    <p className="text-[10px] text-muted-foreground">Margem {q.marginPercent.toFixed(1)}%</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/reserva/${q.id}`)} title="Ver proposta"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(q)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Excluir proposta?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { deleteQuote(q.id); toast.success("Proposta excluída!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {(q.status === "sent" || q.status === "draft") && (
                <Button
                  size="sm"
                  className="w-full bg-success hover:bg-success/90 text-white gap-1.5 font-semibold"
                  onClick={() => approveAndGenerateReservation(q)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar e gerar reserva
                </Button>
              )}
              {q.status === "approved" && (() => {
                const linkedPkg = packages.find((p) => p.quoteId === q.id);
                return (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5"
                    onClick={() => linkedPkg ? navigate(`/pacotes/${linkedPkg.id}`) : navigate(`/pacotes?clientId=${q.clientId}`)}
                  >
                    <PackageIcon className="h-3.5 w-3.5" /> {linkedPkg ? "Ver reserva gerada" : "Ver reservas do cliente"}
                  </Button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quotes;

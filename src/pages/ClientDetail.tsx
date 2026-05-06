import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Phone, Mail, FileText, Plane, DollarSign, Edit2, Trash2,
  User, Heart, ShieldCheck, Clock, Award, Plus, Sparkles, CheckCircle2, Users,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { StatusBadge, clientStatusOptions } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Client, ClientDocument, ClientDocType, FlightClass, Gender, OriginChannel,
  SeatPreference, TravelStyle, Traveler,
} from "@/types/crm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fmtBirthWithAge, fmtCurrency, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SalesJourney, SalesStage } from "@/components/SalesJourney";
import { NextStepBanner } from "@/components/NextStepBanner";

const genderOptions: Record<Gender, string> = {
  male: "Masculino", female: "Feminino", unspecified: "Prefiro não informar",
};
const originOptions: Record<OriginChannel, string> = {
  referral: "Indicação", instagram: "Instagram", google: "Google",
  whatsapp: "WhatsApp", "in-person": "Presencial", other: "Outro",
};
const styleOptions: Record<TravelStyle, string> = {
  beach: "Praia", adventure: "Aventura", culture: "Cultura", cruise: "Cruzeiro",
  honeymoon: "Lua de mel", family: "Família", business: "Negócios",
};
const flightClassOptions: Record<FlightClass, string> = {
  economy: "Econômica", business: "Executiva", first: "Primeira classe",
};
const seatOptions: Record<SeatPreference, string> = {
  window: "Janela", aisle: "Corredor", none: "Sem preferência",
};
const docTypeOptions: Record<ClientDocType, string> = {
  passport: "Passaporte", id: "RG", visa: "Visto", insurance: "Seguro viagem", other: "Outro",
};

// Mask CPF -> 000.000.000-00
const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const docExpiryStatus = (expiresAt?: string) => {
  if (!expiresAt) return { label: "—", tone: "muted" as const };
  const exp = new Date(expiresAt);
  const days = Math.floor((exp.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Vencido", tone: "danger" as const };
  if (days < 90) return { label: `Vence em ${days}d`, tone: "danger" as const };
  if (days < 180) return { label: "Atenção", tone: "warning" as const };
  return { label: "Válido", tone: "ok" as const };
};

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, packages, transactions, updateClient, deleteClient,
    travelers, addTraveler, updateTraveler, deleteTraveler,
    quotes, opportunities } = useData();
  const client = clients.find((c) => c.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Client | null>(null);
  const [docOpen, setDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<ClientDocument>({
    id: "", type: "passport", number: "", issuingCountry: "Brasil", issueDate: "", expiryDate: "",
  });

  // Viajantes
  const [travelerOpen, setTravelerOpen] = useState(false);
  const emptyTraveler: Partial<Traveler> = {
    name: "", document: "", birthDate: "", passportNumber: "", passportExpiry: "",
    passportCountry: "Brasil", nationality: "Brasileira", relation: "", notes: "",
  };
  const [travelerForm, setTravelerForm] = useState<Partial<Traveler>>(emptyTraveler);
  const [editingTravelerId, setEditingTravelerId] = useState<string | null>(null);

  const clientTravelers = useMemo(
    () => travelers.filter((t) => t.clientId === id),
    [travelers, id],
  );

  const clientPackages = useMemo(
    () => (client ? [...packages].filter((p) => p.clientId === client.id) : []),
    [packages, client],
  );
  const clientTransactions = useMemo(
    () => (client ? transactions.filter((t) => t.clientName === client.name) : []),
    [transactions, client],
  );
  const sortedPackages = useMemo(
    () => [...clientPackages].sort((a, b) => b.departureDate.localeCompare(a.departureDate)),
    [clientPackages],
  );

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/clientes")}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <p className="text-muted-foreground">Cliente não encontrado.</p>
      </div>
    );
  }

  const handleEdit = () => { setForm({ ...client }); setEditOpen(true); };
  const handleSave = () => { if (form) { updateClient(form); setEditOpen(false); toast.success("Cliente atualizado!"); } };
  const handleDelete = () => { deleteClient(client.id); toast.success("Cliente excluído!"); navigate("/clientes"); };

  // ----- Profile patcher -----
  const patchProfile = (patch: Partial<NonNullable<Client["profile"]>>) =>
    updateClient({ ...client, profile: { ...(client.profile || {}), ...patch } });
  const patchPreferences = (patch: Partial<NonNullable<Client["preferences"]>>) =>
    updateClient({ ...client, preferences: { styles: [], ...(client.preferences || {}), ...patch } });
  const patchMiles = (patch: Partial<NonNullable<Client["miles"]>>) =>
    updateClient({ ...client, miles: { ...(client.miles || {}), ...patch } });

  const toggleStyle = (s: TravelStyle) => {
    const current = client.preferences?.styles || [];
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    patchPreferences({ styles: next });
  };

  const addDocument = () => {
    if (!newDoc.number.trim()) { toast.error("Número do documento é obrigatório"); return; }
    const docs = [...(client.documents || []), { ...newDoc, id: String(Date.now()) }];
    updateClient({ ...client, documents: docs });
    setNewDoc({ id: "", type: "passport", number: "", issuingCountry: "Brasil", issueDate: "", expiryDate: "" });
    setDocOpen(false);
    toast.success("Documento adicionado");
  };

  const removeDocument = (docId: string) => {
    updateClient({ ...client, documents: (client.documents || []).filter((d) => d.id !== docId) });
    toast.success("Documento removido");
  };

  // ----- Viajantes -----
  const openNewTraveler = () => {
    setEditingTravelerId(null);
    setTravelerForm(emptyTraveler);
    setTravelerOpen(true);
  };
  const openEditTraveler = (t: Traveler) => {
    setEditingTravelerId(t.id);
    setTravelerForm({ ...t });
    setTravelerOpen(true);
  };
  const saveTraveler = async () => {
    if (!travelerForm.name?.trim()) { toast.error("Nome do viajante é obrigatório"); return; }
    try {
      if (editingTravelerId) {
        await updateTraveler({ ...(travelerForm as Traveler), id: editingTravelerId, clientId: client.id });
        toast.success("Viajante atualizado");
      } else {
        await addTraveler({ ...(travelerForm as any), clientId: client.id });
        toast.success("Viajante adicionado");
      }
      setTravelerOpen(false);
    } catch {
      toast.error("Erro ao salvar viajante");
    }
  };
  const removeTraveler = async (tid: string) => {
    await deleteTraveler(tid);
    toast.success("Viajante removido");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clientes")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <p className="label-caption mb-1">Cliente</p>
          <h1 className="text-2xl tracking-tight truncate">{client.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge variant={client.status} />
            <span className="text-xs text-muted-foreground tabular-nums">Desde {fmtDate(client.createdAt)}</span>
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

      {/* Sales journey indicator */}
      {(() => {
        const stageMap: Record<Client["status"], SalesStage> = {
          lead: "lead", negotiation: "opportunity",
          sold: "reservation", recurring: "reservation", postSale: "reservation",
        };
        const completedMap: Record<Client["status"], SalesStage[]> = {
          lead: [], negotiation: ["lead"],
          sold: ["lead", "opportunity", "proposal"],
          recurring: ["lead", "opportunity", "proposal"],
          postSale: ["lead", "opportunity", "proposal"],
        };
        return <SalesJourney current={stageMap[client.status]} completed={completedMap[client.status]} />;
      })()}

      {/* Próxima ação contextual */}
      {client.status === "lead" && (
        <NextStepBanner
          tone="primary"
          icon={<Sparkles className="h-4 w-4" />}
          title="Converter em oportunidade"
          description="Mover este lead para negociação ativa"
          actionLabel="Converter agora"
          onAction={() => {
            updateClient({ ...client, status: "negotiation" });
            toast.success("Cliente em negociação");
          }}
        />
      )}
      {client.status === "negotiation" && (
        <NextStepBanner
          tone="success"
          icon={<FileText className="h-4 w-4" />}
          title="Criar proposta de viagem"
          description="Envie uma cotação para fechar a venda"
          actionLabel="Criar proposta"
          onAction={() => navigate(`/cotacoes?client=${client.id}`)}
        />
      )}
      {(client.status === "sold" || client.status === "recurring") && clientPackages.some((p) => p.paymentStatus === "pending") && (
        <NextStepBanner
          tone="warning"
          icon={<DollarSign className="h-4 w-4" />}
          title="Há pagamentos pendentes"
          description="Acompanhe o financeiro deste cliente"
          actionLabel="Ver financeiro"
          onAction={() => navigate(`/financeiro?clientId=${client.id}`)}
        />
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="profile">Perfil viajante</TabsTrigger>
          <TabsTrigger value="travelers">Viajantes ({clientTravelers.length})</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="miles">Milhas</TabsTrigger>
        </TabsList>

        {/* ---------- Overview ---------- */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="label-caption">Telefone</p><p className="text-sm font-medium">{client.phone}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="label-caption">E-mail</p><p className="text-sm font-medium truncate">{client.email || "—"}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground" /><div><p className="label-caption">Documento</p><p className="text-sm font-medium font-mono">{client.document || "—"}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><Plane className="h-4 w-4 text-muted-foreground" /><div><p className="label-caption">Reservas</p><p className="text-sm font-medium tabular-nums">{clientPackages.length}</p></div></CardContent></Card>
          </div>
          {client.notes && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Observações</CardTitle></CardHeader><CardContent><p className="text-sm">{client.notes}</p></CardContent></Card>
          )}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Financeiro ({clientTransactions.length})</CardTitle></CardHeader>
            <CardContent>
              {clientTransactions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum registro</p> : (
                <div className="space-y-2">
                  {clientTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{fmtDate(t.date)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className={`text-sm font-semibold tabular-nums ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                          {t.type === "income" ? "+" : "-"}{fmtCurrency(t.value)}
                        </p>
                        <StatusBadge variant={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Profile ---------- */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" />Perfil do Viajante</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="label-caption">Data de nascimento</Label>
                <Input type="date" className="mt-1.5" value={client.profile?.birthDate || ""} onChange={(e) => patchProfile({ birthDate: e.target.value })} />
                {client.profile?.birthDate && <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{fmtBirthWithAge(client.profile.birthDate)}</p>}
              </div>
              <div>
                <Label className="label-caption">Gênero</Label>
                <Select value={client.profile?.gender || "unspecified"} onValueChange={(v) => patchProfile({ gender: v as Gender })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(genderOptions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="label-caption">Nacionalidade</Label>
                <Input className="mt-1.5" value={client.profile?.nationality || ""} onChange={(e) => patchProfile({ nationality: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">CPF</Label>
                <Input className="mt-1.5 font-mono" value={client.profile?.cpf || ""} placeholder="000.000.000-00" onChange={(e) => patchProfile({ cpf: maskCPF(e.target.value) })} />
              </div>
              <div>
                <Label className="label-caption">Profissão</Label>
                <Input className="mt-1.5" value={client.profile?.profession || ""} onChange={(e) => patchProfile({ profession: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Canal de origem</Label>
                <Select value={client.profile?.originChannel || "other"} onValueChange={(v) => patchProfile({ originChannel: v as OriginChannel })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(originOptions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Travelers ---------- */}
        <TabsContent value="travelers">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Viajantes vinculados ({clientTravelers.length})
              </CardTitle>
              <Button size="sm" onClick={openNewTraveler}><Plus className="h-3.5 w-3.5" />Adicionar viajante</Button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Cadastre todos os passageiros que viajarão com {client.name}. Esses dados serão reaproveitados automaticamente nas propostas e reservas.
              </p>
              {clientTravelers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum viajante adicional cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {clientTravelers.map((t) => {
                    const passportSt = docExpiryStatus(t.passportExpiry);
                    return (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-navy">{t.name}</p>
                            {t.relation && <span className="text-[11px] text-muted-foreground">· {t.relation}</span>}
                          </div>
                          <p className="text-[11px] text-muted-foreground tabular-nums">
                            {t.document && <>CPF {t.document} · </>}
                            {t.birthDate && <>Nasc. {fmtDate(t.birthDate)} · </>}
                            {t.passportNumber && <>Passaporte {t.passportNumber}</>}
                            {t.passportExpiry && <> · vence {fmtDate(t.passportExpiry)}</>}
                          </p>
                        </div>
                        {t.passportExpiry && (
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
                            passportSt.tone === "danger" && "bg-error-soft text-error-soft-foreground",
                            passportSt.tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                            passportSt.tone === "ok" && "bg-success-soft text-success-soft-foreground",
                            passportSt.tone === "muted" && "bg-muted text-muted-foreground",
                          )}>{passportSt.label}</span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEditTraveler(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeTraveler(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={travelerOpen} onOpenChange={setTravelerOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingTravelerId ? "Editar viajante" : "Novo viajante"}</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="sm:col-span-2"><Label className="label-caption">Nome completo *</Label>
                  <Input className="mt-1.5" value={travelerForm.name || ""} onChange={(e) => setTravelerForm({ ...travelerForm, name: e.target.value })} /></div>
                <div><Label className="label-caption">Relação</Label>
                  <Input className="mt-1.5" placeholder="Esposo(a), filho(a)..." value={travelerForm.relation || ""} onChange={(e) => setTravelerForm({ ...travelerForm, relation: e.target.value })} /></div>
                <div><Label className="label-caption">Nacionalidade</Label>
                  <Input className="mt-1.5" value={travelerForm.nationality || ""} onChange={(e) => setTravelerForm({ ...travelerForm, nationality: e.target.value })} /></div>
                <div><Label className="label-caption">CPF</Label>
                  <Input className="mt-1.5 font-mono" placeholder="000.000.000-00" value={travelerForm.document || ""} onChange={(e) => setTravelerForm({ ...travelerForm, document: maskCPF(e.target.value) })} /></div>
                <div><Label className="label-caption">Data de nascimento</Label>
                  <Input type="date" className="mt-1.5" value={travelerForm.birthDate || ""} onChange={(e) => setTravelerForm({ ...travelerForm, birthDate: e.target.value })} /></div>
                <div><Label className="label-caption">Nº passaporte</Label>
                  <Input className="mt-1.5 font-mono" value={travelerForm.passportNumber || ""} onChange={(e) => setTravelerForm({ ...travelerForm, passportNumber: e.target.value })} /></div>
                <div><Label className="label-caption">Validade passaporte</Label>
                  <Input type="date" className="mt-1.5" value={travelerForm.passportExpiry || ""} onChange={(e) => setTravelerForm({ ...travelerForm, passportExpiry: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label className="label-caption">País emissor</Label>
                  <Input className="mt-1.5" value={travelerForm.passportCountry || ""} onChange={(e) => setTravelerForm({ ...travelerForm, passportCountry: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label className="label-caption">Observações</Label>
                  <Textarea className="mt-1.5" rows={2} value={travelerForm.notes || ""} onChange={(e) => setTravelerForm({ ...travelerForm, notes: e.target.value })} /></div>
              </div>
              <Button onClick={saveTraveler} className="mt-2">{editingTravelerId ? "Salvar alterações" : "Adicionar viajante"}</Button>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ---------- Preferences ---------- */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Preferências de Viagem</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="label-caption">Tipo de viagem preferido</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(styleOptions) as TravelStyle[]).map((s) => {
                    const checked = client.preferences?.styles?.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleStyle(s)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                          checked ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border",
                        )}>
                        {styleOptions[s]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="label-caption">Classe aérea preferida</Label>
                  <Select value={client.preferences?.flightClass || "economy"} onValueChange={(v) => patchPreferences({ flightClass: v as FlightClass })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(flightClassOptions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="label-caption">Companhia aérea favorita</Label>
                  <Input className="mt-1.5" value={client.preferences?.favoriteAirline || ""} onChange={(e) => patchPreferences({ favoriteAirline: e.target.value })} />
                </div>
                <div>
                  <Label className="label-caption">Assento preferido</Label>
                  <Select value={client.preferences?.seatPreference || "none"} onValueChange={(v) => patchPreferences({ seatPreference: v as SeatPreference })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(seatOptions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="label-caption">Restrição alimentar</Label>
                  <Input className="mt-1.5" value={client.preferences?.dietaryRestrictions || ""} onChange={(e) => patchPreferences({ dietaryRestrictions: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="label-caption">Bucket list</Label>
                <Textarea className="mt-1.5" rows={3} value={client.preferences?.bucketList || ""} onChange={(e) => patchPreferences({ bucketList: e.target.value })} placeholder="Destinos desejados..." />
              </div>
              <div>
                <Label className="label-caption">Observações gerais</Label>
                <Textarea className="mt-1.5" rows={3} value={client.preferences?.generalNotes || ""} onChange={(e) => patchPreferences({ generalNotes: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Documents ---------- */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Documentos</CardTitle>
              <Dialog open={docOpen} onOpenChange={setDocOpen}>
                <Button size="sm" onClick={() => setDocOpen(true)}><Plus className="h-3.5 w-3.5" />Adicionar documento</Button>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo documento</DialogTitle></DialogHeader>
                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    <div>
                      <Label className="label-caption">Tipo</Label>
                      <Select value={newDoc.type} onValueChange={(v) => setNewDoc({ ...newDoc, type: v as ClientDocType })}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(docTypeOptions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="label-caption">Número *</Label>
                      <Input className="mt-1.5 font-mono" value={newDoc.number} onChange={(e) => setNewDoc({ ...newDoc, number: e.target.value })} />
                    </div>
                    <div>
                      <Label className="label-caption">País emissor</Label>
                      <Input className="mt-1.5" value={newDoc.issuingCountry} onChange={(e) => setNewDoc({ ...newDoc, issuingCountry: e.target.value })} />
                    </div>
                    <div>
                      <Label className="label-caption">Emissão</Label>
                      <Input type="date" className="mt-1.5" value={newDoc.issueDate} onChange={(e) => setNewDoc({ ...newDoc, issueDate: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="label-caption">Vencimento</Label>
                      <Input type="date" className="mt-1.5" value={newDoc.expiryDate} onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={addDocument} className="mt-2">Adicionar</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {(!client.documents || client.documents.length === 0) ? (
                <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {client.documents.map((d) => {
                    const st = docExpiryStatus(d.expiryDate);
                    return (
                      <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy">{docTypeOptions[d.type]} · <span className="font-mono">{d.number}</span></p>
                          <p className="text-[11px] text-muted-foreground tabular-nums">
                            {d.issuingCountry || "—"} · Emissão {fmtDate(d.issueDate)} · Vence {fmtDate(d.expiryDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
                            st.tone === "danger" && "bg-error-soft text-error-soft-foreground",
                            st.tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                            st.tone === "ok" && "bg-success-soft text-success-soft-foreground",
                            st.tone === "muted" && "bg-muted text-muted-foreground",
                          )}>{st.label}</span>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeDocument(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- History ---------- */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Histórico de Viagens</CardTitle></CardHeader>
            <CardContent>
              {sortedPackages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma reserva registrada</p>
              ) : (
                <ol className="relative space-y-4 ml-2">
                  {sortedPackages.map((p) => (
                    <li key={p.id} className="relative pl-6 cursor-pointer" onClick={() => navigate(`/pacotes/${p.id}`)}>
                      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <span className="absolute left-[3px] top-3 bottom-[-12px] w-px bg-border" />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-navy">
                          {p.destinationFlag} {p.destinationCity}, {p.destinationCountry}
                        </p>
                        <p className="text-sm font-semibold tabular-nums">{fmtCurrency(p.totalValue)}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {fmtDate(p.departureDate)} – {fmtDate(p.returnDate)} · {p.supplier}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Miles ---------- */}
        <TabsContent value="miles">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Gestão de Milhas</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="label-caption">Programa de fidelidade</Label>
                <Input className="mt-1.5" value={client.miles?.program || ""} onChange={(e) => patchMiles({ program: e.target.value })} placeholder="LATAM Pass, Smiles, TudoAzul..." />
              </div>
              <div>
                <Label className="label-caption">Número da conta</Label>
                <Input className="mt-1.5 font-mono" value={client.miles?.accountNumber || ""} onChange={(e) => patchMiles({ accountNumber: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Saldo de milhas</Label>
                <Input type="number" className="mt-1.5 tabular-nums" value={client.miles?.balance ?? ""} onChange={(e) => patchMiles({ balance: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="label-caption">Vencimento das milhas</Label>
                <Input type="date" className="mt-1.5" value={client.miles?.expiresAt || ""} onChange={(e) => patchMiles({ expiresAt: e.target.value })} />
                {client.miles?.expiresAt && <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{fmtDate(client.miles.expiresAt)}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit dialog (basic info) */}
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
                    {clientStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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

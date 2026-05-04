import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Voucher, VoucherType } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, Trash2, Pencil, CheckCircle2, Clock, Building2, Bus, Camera, Hotel, MoreHorizontal, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generateVoucherPdf } from "@/lib/voucherPdf";

const TYPE_META: Record<VoucherType, { label: string; icon: any; color: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "bg-blue-500/10 text-blue-600" },
  transfer: { label: "Transfer", icon: Bus, color: "bg-emerald-500/10 text-emerald-600" },
  tour: { label: "Passeio", icon: Camera, color: "bg-amber-500/10 text-amber-600" },
  ticket: { label: "Ingresso", icon: Ticket, color: "bg-purple-500/10 text-purple-600" },
  other: { label: "Outro", icon: MoreHorizontal, color: "bg-slate-500/10 text-slate-600" },
};

const empty: Partial<Voucher> = {
  title: "", type: "hotel", supplier: "", confirmationCode: "",
  serviceDate: "", details: {}, notes: "", issued: false,
};

export default function Vouchers() {
  const { vouchers, packages, addVoucher, updateVoucher, deleteVoucher } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState<Partial<Voucher>>(empty);
  const [filterType, setFilterType] = useState<"all" | VoucherType>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => vouchers.filter((v) => {
    if (filterType !== "all" && v.type !== filterType) return false;
    if (search && !`${v.title} ${v.supplier} ${v.confirmationCode ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [vouchers, filterType, search]);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (v: Voucher) => { setEditing(v); setForm({ ...v }); setOpen(true); };

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error("Informe o título"); return; }
    try {
      if (editing) {
        await updateVoucher({ ...editing, ...form } as Voucher);
        toast.success("Voucher atualizado");
      } else {
        await addVoucher({
          title: form.title!, type: (form.type ?? "other") as VoucherType,
          packageId: form.packageId, supplier: form.supplier ?? "",
          confirmationCode: form.confirmationCode, serviceDate: form.serviceDate,
          details: form.details ?? {}, notes: form.notes ?? "", issued: form.issued ?? false,
        });
        toast.success("Voucher criado");
      }
      setOpen(false);
    } catch (e: any) { toast.error("Erro ao salvar", { description: e.message }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este voucher?")) return;
    try { await deleteVoucher(id); toast.success("Excluído"); }
    catch (e: any) { toast.error("Erro", { description: e.message }); }
  };

  const toggleIssued = async (v: Voucher) => {
    try { await updateVoucher({ ...v, issued: !v.issued }); }
    catch (e: any) { toast.error("Erro", { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Vouchers</h1>
          <p className="text-sm text-muted-foreground">Documentos de serviços (hotel, transfer, passeios, ingressos)</p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Novo voucher</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Buscar por título, fornecedor, código..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {(Object.keys(TYPE_META) as VoucherType[]).map((t) => (
              <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold">Nenhum voucher</p>
            <p className="text-sm text-muted-foreground mb-4">Crie vouchers de hotel, transfer, passeios e ingressos.</p>
            <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Criar primeiro</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => {
            const meta = TYPE_META[v.type];
            const Icon = meta.icon;
            const pkg = packages.find((p) => p.id === v.packageId);
            return (
              <Card key={v.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm truncate">{v.title}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{v.supplier || "—"}</p>
                      </div>
                    </div>
                    <Badge variant={v.issued ? "default" : "outline"} className="text-[10px] shrink-0">
                      {v.issued ? <><CheckCircle2 className="h-3 w-3 mr-1" />Emitido</> : <><Clock className="h-3 w-3 mr-1" />Pendente</>}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Código:</span> <span className="font-mono">{v.confirmationCode || "—"}</span></div>
                    <div><span className="text-muted-foreground">Data:</span> {v.serviceDate ? new Date(v.serviceDate).toLocaleDateString("pt-BR") : "—"}</div>
                  </div>
                  {pkg && <p className="text-xs text-muted-foreground truncate">📦 {pkg.name}</p>}
                  <div className="flex gap-1 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => { generateVoucherPdf(v, pkg); toast.success("PDF gerado"); }}
                      className="flex-1"
                    >
                      <FileDown className="h-3.5 w-3.5 mr-1" />Gerar PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant={v.issued ? "outline" : "secondary"} onClick={() => toggleIssued(v)}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)} className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Novo"} voucher</DialogTitle>
            <DialogDescription>Cadastre o voucher de serviço com fornecedor, código e data.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type ?? "hotel"} onValueChange={(v) => setForm((f) => ({ ...f, type: v as VoucherType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_META) as VoucherType[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Viagem (opcional)</Label>
                <Select value={form.packageId ?? "none"} onValueChange={(v) => setForm((f) => ({ ...f, packageId: v === "none" ? undefined : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Título</Label>
              <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Hotel Copacabana Palace - 3 diárias" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Fornecedor</Label>
                <Input value={form.supplier ?? ""} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} />
              </div>
              <div>
                <Label>Código de confirmação</Label>
                <Input value={form.confirmationCode ?? ""} onChange={(e) => setForm((f) => ({ ...f, confirmationCode: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Data do serviço</Label>
              <Input type="date" value={form.serviceDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))} />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Detalhes do serviço, instruções, contato..." />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={!!form.issued} onChange={(e) => setForm((f) => ({ ...f, issued: e.target.checked }))} />
              Voucher emitido
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

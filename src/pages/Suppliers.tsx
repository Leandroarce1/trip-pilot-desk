import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Eye, Edit2, Trash2, Building2, Star, Globe, Phone, Mail,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Supplier, SupplierCategory, SupplierPaymentTerm } from "@/types/crm";
import {
  supplierCategoryLabels, supplierCategoryBadge, supplierCategoryOrder,
  paymentTermLabels, emptySupplierForm, SupplierFormState,
} from "@/lib/suppliers";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RatingStars = ({ value, onChange, size = 14 }: { value: number; onChange?: (n: number) => void; size?: number }) => (
  <div className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        className={cn("transition-colors", onChange && "hover:scale-110")}
        aria-label={`${n} estrelas`}
      >
        <Star
          style={{ width: size, height: size }}
          className={n <= value ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-muted-foreground/30"}
        />
      </button>
    ))}
  </div>
);

const Suppliers = () => {
  const navigate = useNavigate();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | SupplierCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptySupplierForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((s) => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.contactName.toLowerCase().includes(q);
      const matchCat = categoryFilter === "all" || s.category === categoryFilter;
      const matchStatus = statusFilter === "all"
        || (statusFilter === "active" && s.active)
        || (statusFilter === "inactive" && !s.active);
      return matchSearch && matchCat && matchStatus;
    });
  }, [suppliers, search, categoryFilter, statusFilter]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptySupplierForm); }
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name, category: s.category, cnpj: s.cnpj || "", website: s.website || "",
      contactName: s.contactName, contactPhone: s.contactPhone, contactEmail: s.contactEmail,
      defaultCommission: s.defaultCommission, paymentTerm: s.paymentTerm,
      accessNotes: s.accessNotes || "", notes: s.notes || "",
      rating: s.rating, active: s.active,
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nome do fornecedor é obrigatório"); return; }
    if (editing) {
      updateSupplier({ ...editing, ...form });
      toast.success("Fornecedor atualizado");
    } else {
      addSupplier(form);
      toast.success("Fornecedor cadastrado");
    }
    handleOpenChange(false);
  };

  return (
    <div className="space-y-6">
      <BackButton fallback="/" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-caption mb-1">Operação</p>
          <h1 className="text-3xl tracking-tight">Fornecedores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {suppliers.filter((s) => s.active).length} ativo(s) de {suppliers.length} cadastrados
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Novo fornecedor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="label-caption">Nome da empresa *</Label>
                <Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as SupplierCategory })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {supplierCategoryOrder.map((c) => (
                      <SelectItem key={c} value={c}>{supplierCategoryLabels[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="label-caption">CNPJ</Label>
                <Input className="mt-1.5 font-mono" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
              </div>
              <div className="sm:col-span-2">
                <Label className="label-caption">Site oficial</Label>
                <Input className="mt-1.5" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label className="label-caption">Contato — nome</Label>
                <Input className="mt-1.5" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Telefone / WhatsApp</Label>
                <Input className="mt-1.5" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label className="label-caption">Email comercial</Label>
                <Input className="mt-1.5" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div>
                <Label className="label-caption">Comissão padrão (%)</Label>
                <Input className="mt-1.5" type="number" min="0" max="100"
                  value={form.defaultCommission}
                  onChange={(e) => setForm({ ...form, defaultCommission: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="label-caption">Prazo de pagamento de comissão</Label>
                <Select value={form.paymentTerm} onValueChange={(v) => setForm({ ...form, paymentTerm: v as SupplierPaymentTerm })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(paymentTermLabels) as SupplierPaymentTerm[]).map((k) => (
                      <SelectItem key={k} value={k}>{paymentTermLabels[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="label-caption">Forma de acesso</Label>
                <Textarea className="mt-1.5" value={form.accessNotes} onChange={(e) => setForm({ ...form, accessNotes: e.target.value })} placeholder="Login, senha, portal..." rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label className="label-caption">Observações</Label>
                <Textarea className="mt-1.5" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
              <div>
                <Label className="label-caption">Avaliação</Label>
                <div className="mt-2"><RatingStars value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size={20} /></div>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <Label className="label-caption">Status</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                    <span className="text-sm">{form.active ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2 gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSubmit}>{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou contato..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {supplierCategoryOrder.map((c) => (
                <SelectItem key={c} value={c}>{supplierCategoryLabels[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Contato</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/fornecedores/${s.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">{s.name}</p>
                          {s.website && <p className="text-[11px] text-muted-foreground truncate">{s.website.replace(/^https?:\/\//, "")}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]", supplierCategoryBadge[s.category])}>
                        {supplierCategoryLabels[s.category]}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm">{s.contactName}</p>
                      <p className="text-[11px] text-muted-foreground">{s.contactPhone}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.contactEmail}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-navy">{s.defaultCommission}%</TableCell>
                    <TableCell><RatingStars value={s.rating} /></TableCell>
                    <TableCell>
                      {s.active ? (
                        <span className="inline-flex items-center rounded-full bg-success-soft text-success-soft-foreground px-2.5 py-0.5 text-[11px] font-semibold uppercase">Ativo</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[11px] font-semibold uppercase">Inativo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/fornecedores/${s.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => { deleteSupplier(s.id); toast.success("Fornecedor excluído"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;

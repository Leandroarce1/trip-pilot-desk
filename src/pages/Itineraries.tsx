import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Itinerary, ItineraryDayDetailed } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Map, Trash2, Link2, Copy, Pencil } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) +
  "-" + Math.random().toString(36).slice(2, 7);

const emptyDay = (n: number): ItineraryDayDetailed => ({
  day: n, title: `Dia ${n}`, periods: { morning: "", afternoon: "", evening: "" },
});

export default function Itineraries() {
  const { itineraries, packages, addItinerary, updateItinerary, deleteItinerary } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Itinerary | null>(null);
  const [form, setForm] = useState<Partial<Itinerary>>({ title: "", days: [emptyDay(1)] });

  const startCreate = () => {
    setEditing(null);
    setForm({ title: "", packageId: undefined, days: [emptyDay(1)] });
    setOpen(true);
  };
  const startEdit = (it: Itinerary) => {
    setEditing(it);
    setForm({ ...it });
    setOpen(true);
  };

  const addDay = () => setForm((f) => ({
    ...f, days: [...(f.days ?? []), emptyDay((f.days?.length ?? 0) + 1)],
  }));
  const removeDay = (idx: number) => setForm((f) => ({
    ...f, days: (f.days ?? []).filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })),
  }));
  const updateDay = (idx: number, patch: Partial<ItineraryDayDetailed>) =>
    setForm((f) => ({
      ...f, days: (f.days ?? []).map((d, i) => i === idx ? { ...d, ...patch, periods: { ...d.periods, ...(patch.periods ?? {}) } } : d),
    }));

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error("Informe o título"); return; }
    try {
      if (editing) {
        await updateItinerary({ ...editing, ...form, days: form.days ?? [] } as Itinerary);
        toast.success("Itinerário atualizado");
      } else {
        await addItinerary({
          title: form.title!, packageId: form.packageId, quoteId: form.quoteId,
          days: form.days ?? [], shareableSlug: undefined,
        });
        toast.success("Itinerário criado");
      }
      setOpen(false);
    } catch (e: any) { toast.error("Erro ao salvar", { description: e.message }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este itinerário?")) return;
    try { await deleteItinerary(id); toast.success("Excluído"); }
    catch (e: any) { toast.error("Erro", { description: e.message }); }
  };

  const handleShare = async (it: Itinerary) => {
    try {
      const slug = it.shareableSlug ?? slugify(it.title);
      if (!it.shareableSlug) {
        await updateItinerary({ ...it, shareableSlug: slug });
      }
      const url = `${window.location.origin}/itinerario/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!", { description: url });
    } catch (e: any) { toast.error("Erro ao gerar link", { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Itinerários</h1>
          <p className="text-sm text-muted-foreground">Roteiros dia-a-dia compartilháveis com seus clientes</p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Novo itinerário</Button>
      </div>

      {itineraries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Map className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold">Nenhum itinerário ainda</p>
            <p className="text-sm text-muted-foreground mb-4">Crie roteiros com manhã, tarde e noite e compartilhe via link.</p>
            <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Criar primeiro</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {itineraries.map((it) => {
            const pkg = packages.find((p) => p.id === it.packageId);
            return (
              <Card key={it.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{it.title}</CardTitle>
                    {it.shareableSlug && <Badge variant="secondary" className="text-[10px]">público</Badge>}
                  </div>
                  {pkg && <p className="text-xs text-muted-foreground">{pkg.name}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{it.days.length} dia(s)</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(it)}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare(it)}>
                      {it.shareableSlug ? <Copy className="h-3.5 w-3.5 mr-1" /> : <Link2 className="h-3.5 w-3.5 mr-1" />}
                      {it.shareableSlug ? "Copiar" : "Compartilhar"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(it.id)} className="text-destructive">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Novo"} itinerário</DialogTitle>
            <DialogDescription>Defina título, viagem vinculada (opcional) e os dias com manhã, tarde e noite.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Título</Label>
                <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Roteiro Lua de Mel — Cancun" />
              </div>
              <div>
                <Label>Viagem vinculada (opcional)</Label>
                <Select value={form.packageId ?? "none"} onValueChange={(v) => setForm((f) => ({ ...f, packageId: v === "none" ? undefined : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dias do roteiro</Label>
                <Button size="sm" variant="outline" onClick={addDay}><Plus className="h-3.5 w-3.5 mr-1" />Adicionar dia</Button>
              </div>
              {(form.days ?? []).map((d, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>Dia {d.day}</Badge>
                      <Input value={d.title} onChange={(e) => updateDay(idx, { title: e.target.value })} placeholder="Título do dia" className="flex-1" />
                      <Input type="date" value={d.date ?? ""} onChange={(e) => updateDay(idx, { date: e.target.value })} className="w-40" />
                      <Button size="sm" variant="ghost" onClick={() => removeDay(idx)} className="text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Textarea placeholder="Manhã" value={d.periods.morning ?? ""} onChange={(e) => updateDay(idx, { periods: { morning: e.target.value } })} rows={2} />
                      <Textarea placeholder="Tarde" value={d.periods.afternoon ?? ""} onChange={(e) => updateDay(idx, { periods: { afternoon: e.target.value } })} rows={2} />
                      <Textarea placeholder="Noite" value={d.periods.evening ?? ""} onChange={(e) => updateDay(idx, { periods: { evening: e.target.value } })} rows={2} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

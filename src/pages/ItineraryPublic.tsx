import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Itinerary, ItineraryDayDetailed } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Sun, Sunset, Moon } from "lucide-react";

export default function ItineraryPublic() {
  const { slug } = useParams<{ slug: string }>();
  const [it, setIt] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await supabase.from("itineraries").select("*").eq("shareable_slug", slug).maybeSingle();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setIt({
        id: data.id, title: data.title, packageId: data.package_id ?? undefined,
        quoteId: data.quote_id ?? undefined, days: (data.days ?? []) as ItineraryDayDetailed[],
        shareableSlug: data.shareable_slug ?? undefined, createdAt: data.created_at?.slice(0, 10) ?? "",
      });
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (notFound || !it) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <Map className="h-10 w-10 text-muted-foreground" />
      <p className="font-semibold">Itinerário não encontrado</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3">Roteiro de viagem</Badge>
          <h1 className="text-3xl md:text-4xl font-black">{it.title}</h1>
          <p className="text-sm opacity-70 mt-2">{it.days.length} dia(s) de experiências cuidadosamente planejadas</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {it.days.map((d) => (
          <Card key={d.day}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[hsl(var(--gold))] text-navy flex items-center justify-center font-black">
                  {d.day}
                </div>
                <div>
                  <h2 className="font-bold">{d.title}</h2>
                  {d.date && <p className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString("pt-BR")}</p>}
                </div>
              </div>
              <div className="grid gap-2 pl-13">
                {d.periods.morning && (
                  <div className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <Sun className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Manhã</p><p className="text-sm whitespace-pre-wrap">{d.periods.morning}</p></div>
                  </div>
                )}
                {d.periods.afternoon && (
                  <div className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <Sunset className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Tarde</p><p className="text-sm whitespace-pre-wrap">{d.periods.afternoon}</p></div>
                  </div>
                )}
                {d.periods.evening && (
                  <div className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <Moon className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Noite</p><p className="text-sm whitespace-pre-wrap">{d.periods.evening}</p></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        Powered by FlowDestinos
      </footer>
    </div>
  );
}

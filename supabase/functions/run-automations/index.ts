// Edge function diária: gera notificações de automação por usuário.
// Usa SERVICE_ROLE para varrer todos os usuários e inserir em notifications.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MS_DAY = 86400000;
const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / MS_DAY);
const monthsBetween = (a: Date, b: Date) =>
  (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());

interface Notif {
  user_id: string;
  type: "checkin" | "payment" | "departure" | "general";
  title: string;
  message: string;
  date: string;
  read: boolean;
  related_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);

    const [pkgRes, cliRes, travRes, notifRes] = await Promise.all([
      supabase.from("packages").select("id,user_id,client_id,destination_city,departure_date,return_date"),
      supabase.from("clients").select("id,user_id,name,profile"),
      supabase.from("travelers").select("id,user_id,name,birth_date"),
      supabase.from("notifications").select("user_id,related_id"),
    ]);

    if (pkgRes.error) throw pkgRes.error;
    if (cliRes.error) throw cliRes.error;
    if (travRes.error) throw travRes.error;
    if (notifRes.error) throw notifRes.error;

    const clientNameById = new Map<string, string>();
    for (const c of cliRes.data ?? []) clientNameById.set(c.id, c.name ?? "");

    const existing = new Set<string>();
    for (const n of notifRes.data ?? []) {
      if (n.related_id) existing.add(`${n.user_id}|${n.related_id}`);
    }

    const toInsert: Notif[] = [];
    const push = (n: Notif) => {
      const k = `${n.user_id}|${n.related_id}`;
      if (existing.has(k)) return;
      existing.add(k);
      toInsert.push(n);
    };

    // 1) Pós-viagem & 2) Recorrência & 4) Embarque
    for (const p of pkgRes.data ?? []) {
      const clientName = clientNameById.get(p.client_id ?? "") ?? "";
      const city = p.destination_city ?? "";
      if (p.return_date) {
        const ret = new Date(p.return_date);
        const days = daysBetween(today, ret);
        if (days >= 2 && days <= 30) {
          push({
            user_id: p.user_id, type: "general",
            title: "Pesquisa de satisfação pendente",
            message: `${clientName} retornou de ${city}. Envie agradecimento e peça avaliação.`,
            date: todayIso, read: false, related_id: `postsale:${p.id}`,
          });
        }
        const m = monthsBetween(today, ret);
        if (m >= 11 && m <= 13) {
          push({
            user_id: p.user_id, type: "general",
            title: "Hora de oferecer uma nova viagem",
            message: `Faz quase 1 ano que ${clientName} viajou para ${city}. Reabra a oportunidade.`,
            date: todayIso, read: false, related_id: `recurrence:${p.id}`,
          });
        }
      }
      if (p.departure_date) {
        const days = daysBetween(new Date(p.departure_date), today);
        if (days >= 0 && days <= 7) {
          push({
            user_id: p.user_id, type: "departure",
            title: `Embarque em ${days} dia(s)`,
            message: `${clientName} embarca para ${city}. Confira documentos e vouchers.`,
            date: todayIso, read: false, related_id: `departure:${p.id}`,
          });
        }
      }
    }

    // 3) Aniversários
    const birthday = (
      userId: string, id: string, name: string, birth: string | null | undefined, label: string,
    ) => {
      if (!birth) return;
      const b = new Date(birth);
      const next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const days = daysBetween(next, today);
      if (days <= 7) {
        push({
          user_id: userId, type: "general",
          title: `Aniversário próximo (${label})`,
          message: `${name} faz aniversário em ${days === 0 ? "hoje" : `${days} dia(s)`}. Envie uma mensagem.`,
          date: todayIso, read: false,
          related_id: `birthday:${id}:${today.getFullYear()}`,
        });
      }
    };
    for (const c of cliRes.data ?? []) {
      const profile = (c.profile ?? {}) as { birthDate?: string };
      birthday(c.user_id, c.id, c.name ?? "", profile.birthDate, "cliente");
    }
    for (const t of travRes.data ?? []) {
      birthday(t.user_id, t.id, t.name ?? "", t.birth_date, "viajante");
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from("notifications").insert(toInsert);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, created: toInsert.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// Funções puras de automação. Extraídas para serem testáveis e
// reutilizadas tanto no client (fallback) quanto na edge function diária.

export interface AutomationPackage {
  id: string;
  clientName: string;
  destinationCity: string;
  departureDate?: string;
  returnDate?: string;
}

export interface AutomationPerson {
  id: string;
  name: string;
  birthDate?: string;
}

export interface AutomationNotification {
  type: "checkin" | "payment" | "departure" | "general";
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId: string;
}

const MS_DAY = 86400000;

export const daysBetween = (a: Date, b: Date): number =>
  Math.floor((a.getTime() - b.getTime()) / MS_DAY);

export const monthsBetween = (a: Date, b: Date): number =>
  (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());

/** Próximo aniversário a partir de `today`. Retorna nº de dias até a data. */
export const daysUntilNextBirthday = (birthDateIso: string, today: Date): number => {
  // Parse ISO date (YYYY-MM-DD) sem fuso para evitar off-by-one.
  const [, mStr, dStr] = birthDateIso.slice(0, 10).split("-");
  const month = Number(mStr) - 1;
  const day = Number(dStr);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  let nextUtc = Date.UTC(today.getFullYear(), month, day);
  if (nextUtc < todayUtc) nextUtc = Date.UTC(today.getFullYear() + 1, month, day);
  return Math.round((nextUtc - todayUtc) / MS_DAY);
};

export interface BuildOpts {
  packages: AutomationPackage[];
  clients: AutomationPerson[];
  travelers: AutomationPerson[];
  existingKeys: Set<string>;
  today?: Date;
}

/** Gera a lista de notificações que devem ser criadas hoje (sem duplicar). */
export function buildAutomationNotifications(opts: BuildOpts): AutomationNotification[] {
  const today = opts.today ?? new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const out: AutomationNotification[] = [];
  const seen = new Set(opts.existingKeys);

  const push = (n: AutomationNotification) => {
    if (seen.has(n.relatedId)) return;
    seen.add(n.relatedId);
    out.push(n);
  };

  // 1) Pós-viagem (2-30 dias após retorno)
  for (const p of opts.packages) {
    if (!p.returnDate) continue;
    const days = daysBetween(today, new Date(p.returnDate));
    if (days >= 2 && days <= 30) {
      push({
        type: "general",
        title: "Pesquisa de satisfação pendente",
        message: `${p.clientName} retornou de ${p.destinationCity}. Envie agradecimento e peça avaliação.`,
        date: todayIso, read: false, relatedId: `postsale:${p.id}`,
      });
    }
  }

  // 2) Recorrência (11-13 meses após retorno)
  for (const p of opts.packages) {
    if (!p.returnDate) continue;
    const m = monthsBetween(today, new Date(p.returnDate));
    if (m >= 11 && m <= 13) {
      push({
        type: "general",
        title: "Hora de oferecer uma nova viagem",
        message: `Faz quase 1 ano que ${p.clientName} viajou para ${p.destinationCity}. Reabra a oportunidade.`,
        date: todayIso, read: false, relatedId: `recurrence:${p.id}`,
      });
    }
  }

  // 3) Aniversários (≤ 7 dias)
  const birthday = (p: AutomationPerson, label: string) => {
    if (!p.birthDate) return;
    const days = daysUntilNextBirthday(p.birthDate, today);
    if (days <= 7) {
      push({
        type: "general",
        title: `Aniversário próximo (${label})`,
        message: `${p.name} faz aniversário em ${days === 0 ? "hoje" : `${days} dia(s)`}. Envie uma mensagem.`,
        date: todayIso, read: false, relatedId: `birthday:${p.id}:${today.getFullYear()}`,
      });
    }
  };
  opts.clients.forEach((c) => birthday(c, "cliente"));
  opts.travelers.forEach((t) => birthday(t, "viajante"));

  // 4) Embarque (≤ 7 dias)
  for (const p of opts.packages) {
    if (!p.departureDate) continue;
    const days = daysBetween(new Date(p.departureDate), today);
    if (days >= 0 && days <= 7) {
      push({
        type: "departure",
        title: `Embarque em ${days} dia(s)`,
        message: `${p.clientName} embarca para ${p.destinationCity}. Confira documentos e vouchers.`,
        date: todayIso, read: false, relatedId: `departure:${p.id}`,
      });
    }
  }

  return out;
}

/** Aniversário em ≤ 7 dias (inclusive hoje). */
export const isBirthdaySoon = (birthDateIso?: string, today: Date = new Date()): boolean => {
  if (!birthDateIso) return false;
  const days = daysUntilNextBirthday(birthDateIso, today);
  return days >= 0 && days <= 7;
};

/** Embarque em ≤ 7 dias (inclusive hoje, exclui passado). */
export const isDepartureSoon = (departureDateIso?: string, today: Date = new Date()): boolean => {
  if (!departureDateIso) return false;
  const days = daysBetween(new Date(departureDateIso), today);
  return days >= 0 && days <= 7;
};

/** Check-in dentro de 48h antes do embarque. */
export const checkInAlert = (departureDateIso?: string, now: Date = new Date()): boolean => {
  if (!departureDateIso) return false;
  const dep = new Date(departureDateIso).getTime();
  const diffH = (dep - now.getTime()) / 3600000;
  return diffH >= 0 && diffH <= 48;
};

// ============= Automações 100% client-side =============
// Geram notificações sintéticas (não persistidas) com id prefixado por "auto:".

export interface ClientSideClient {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}
export interface ClientSideOpportunity {
  id: string;
  title: string;
  clientName: string;
  stage: string;
  createdAt: string;
}
export interface ClientSideQuote {
  id: string;
  clientName: string;
  destination: string;
  status: string;
  createdAt: string;
}
export interface ClientSidePackage {
  clientId: string;
  returnDate?: string;
}

export interface ClientSideOpts {
  clients: ClientSideClient[];
  opportunities: ClientSideOpportunity[];
  quotes: ClientSideQuote[];
  packages: ClientSidePackage[];
  today?: Date;
}

/** Cliente sold/postSale/recurring sem viagem há +30 dias (e cadastrado há +30d). */
export function inactiveClientNotifications(opts: ClientSideOpts): AutomationNotification[] {
  const today = opts.today ?? new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const lastTrip = new Map<string, Date>();
  for (const p of opts.packages) {
    if (!p.returnDate) continue;
    const d = new Date(p.returnDate);
    const cur = lastTrip.get(p.clientId);
    if (!cur || d > cur) lastTrip.set(p.clientId, d);
  }
  const out: AutomationNotification[] = [];
  for (const c of opts.clients) {
    if (!["sold", "postSale", "recurring"].includes(c.status)) continue;
    const ref = lastTrip.get(c.id) ?? new Date(c.createdAt);
    const days = daysBetween(today, ref);
    if (days >= 30) {
      out.push({
        type: "general",
        title: "Cliente inativo há 30+ dias",
        message: `${c.name} não tem interação registrada há ${days} dias. Que tal um follow-up?`,
        date: todayIso, read: false,
        relatedId: `auto:inactive:${c.id}`,
      });
    }
  }
  return out;
}

/** Oportunidade aberta parada (sem update) há 7+ dias. */
export function stalledOpportunityNotifications(opts: ClientSideOpts): AutomationNotification[] {
  const today = opts.today ?? new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const out: AutomationNotification[] = [];
  for (const o of opts.opportunities) {
    if (o.stage === "closed_won" || o.stage === "closed_lost") continue;
    const days = daysBetween(today, new Date(o.createdAt));
    if (days >= 7) {
      out.push({
        type: "general",
        title: "Oportunidade parada há 7+ dias",
        message: `"${o.title}" (${o.clientName}) está sem movimento há ${days} dias.`,
        date: todayIso, read: false,
        relatedId: `auto:stalled:${o.id}`,
      });
    }
  }
  return out;
}

/** Orçamento enviado sem resposta há 3+ dias = lembrete de follow-up. */
export function followUpQuoteNotifications(opts: ClientSideOpts): AutomationNotification[] {
  const today = opts.today ?? new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const out: AutomationNotification[] = [];
  for (const q of opts.quotes) {
    if (q.status !== "sent") continue;
    const days = daysBetween(today, new Date(q.createdAt));
    if (days >= 3) {
      out.push({
        type: "general",
        title: "Follow-up de orçamento",
        message: `Orçamento de ${q.destination} para ${q.clientName} foi enviado há ${days} dias sem retorno.`,
        date: todayIso, read: false,
        relatedId: `auto:followup:${q.id}`,
      });
    }
  }
  return out;
}

export function buildClientSideNotifications(opts: ClientSideOpts): AutomationNotification[] {
  return [
    ...inactiveClientNotifications(opts),
    ...stalledOpportunityNotifications(opts),
    ...followUpQuoteNotifications(opts),
  ];
}

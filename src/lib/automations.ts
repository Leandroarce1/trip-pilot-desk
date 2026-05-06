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
  const b = new Date(birthDateIso);
  const next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return daysBetween(next, today);
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

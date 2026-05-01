import { cn } from "@/lib/utils";

type StatusVariant =
  | "lead" | "negotiation" | "sold" | "postSale" | "recurring"
  | "draft" | "sent" | "approved" | "cancelled" | "lost"
  | "paid" | "pending";

const styles: Record<StatusVariant, string> = {
  // Clients
  lead: "bg-info-soft text-info-soft-foreground",
  negotiation: "bg-warning-soft text-warning-soft-foreground",
  sold: "bg-success-soft text-success-soft-foreground",
  postSale: "bg-secondary text-secondary-foreground",
  recurring: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--navy))]",
  // Quotes
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info-soft text-info-soft-foreground",
  approved: "bg-success-soft text-success-soft-foreground",
  cancelled: "bg-error-soft text-error-soft-foreground",
  lost: "bg-error-soft text-error-soft-foreground",
  // Payments
  paid: "bg-success-soft text-success-soft-foreground",
  pending: "bg-warning-soft text-warning-soft-foreground",
};

const labels: Record<StatusVariant, string> = {
  lead: "Prospect",
  negotiation: "Em cotação",
  sold: "Cliente ativo",
  postSale: "Pós-venda",
  recurring: "Cliente recorrente",
  draft: "Rascunho",
  sent: "Enviada",
  approved: "Aprovada",
  cancelled: "Cancelada",
  lost: "Perdida",
  paid: "Pago",
  pending: "Pendente",
};

export function StatusBadge({ variant }: { variant: StatusVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
        styles[variant],
      )}
    >
      {labels[variant]}
    </span>
  );
}

export const clientStatusOptions: Array<{ value: StatusVariant; label: string }> = [
  { value: "lead", label: "Prospect" },
  { value: "negotiation", label: "Em cotação" },
  { value: "sold", label: "Cliente ativo" },
  { value: "recurring", label: "Cliente recorrente" },
  { value: "postSale", label: "Pós-venda" },
];

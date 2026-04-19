import { cn } from "@/lib/utils";

type StatusVariant = "lead" | "negotiation" | "sold" | "postSale" | "sent" | "approved" | "cancelled" | "paid" | "pending";

// FlowDestinos status palette — soft pastel surface + deep readable text
const styles: Record<StatusVariant, string> = {
  lead: "bg-info-soft text-info-soft-foreground",
  negotiation: "bg-warning-soft text-warning-soft-foreground",
  sold: "bg-success-soft text-success-soft-foreground",
  postSale: "bg-secondary text-secondary-foreground",
  sent: "bg-info-soft text-info-soft-foreground",
  approved: "bg-success-soft text-success-soft-foreground",
  cancelled: "bg-error-soft text-error-soft-foreground",
  paid: "bg-success-soft text-success-soft-foreground",
  pending: "bg-warning-soft text-warning-soft-foreground",
};

const labels: Record<StatusVariant, string> = {
  lead: "Lead",
  negotiation: "Em negociação",
  sold: "Vendido",
  postSale: "Pós-venda",
  sent: "Enviada",
  approved: "Aprovada",
  cancelled: "Cancelada",
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

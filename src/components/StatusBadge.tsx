import { cn } from "@/lib/utils";

type StatusVariant = "lead" | "negotiation" | "sold" | "postSale" | "sent" | "approved" | "cancelled" | "paid" | "pending";

const styles: Record<StatusVariant, string> = {
  lead: "bg-info/15 text-info",
  negotiation: "bg-warning/15 text-warning",
  sold: "bg-success/15 text-success",
  postSale: "bg-primary/15 text-primary",
  sent: "bg-info/15 text-info",
  approved: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
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
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant])}>
      {labels[variant]}
    </span>
  );
}

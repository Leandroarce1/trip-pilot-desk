import { Check, Target, Sparkles, FileText, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export type SalesStage = "lead" | "opportunity" | "proposal" | "reservation";

const stages: Array<{ key: SalesStage; label: string; icon: typeof Check }> = [
  { key: "lead", label: "Lead", icon: Target },
  { key: "opportunity", label: "Oportunidade", icon: Sparkles },
  { key: "proposal", label: "Proposta", icon: FileText },
  { key: "reservation", label: "Reserva", icon: Package },
];

interface Props {
  current: SalesStage;
  /** Optional: highlight stages already completed beyond current. */
  completed?: SalesStage[];
  className?: string;
}

const order: Record<SalesStage, number> = {
  lead: 0,
  opportunity: 1,
  proposal: 2,
  reservation: 3,
};

export function SalesJourney({ current, completed, className }: Props) {
  const currentIdx = order[current];

  return (
    <div className={cn("w-full rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-3", className)}>
      <div className="flex items-center justify-between">
        {stages.map((stage, i) => {
          const isDone = completed?.includes(stage.key) || i < currentIdx;
          const isCurrent = i === currentIdx;
          const Icon = stage.icon;
          return (
            <div key={stage.key} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isDone && "bg-success border-success text-white",
                    isCurrent && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/15",
                    !isDone && !isCurrent && "bg-muted border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[hsl(var(--gold))] ring-2 ring-card animate-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10.5px] font-semibold uppercase tracking-wider truncate",
                    isCurrent ? "text-primary" : isDone ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-muted">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      i < currentIdx ? "bg-success w-full" : "bg-muted w-0",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

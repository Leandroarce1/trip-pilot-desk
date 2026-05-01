import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  tone?: "primary" | "success" | "warning" | "gold";
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function NextStepBanner({
  title, description, actionLabel, onAction, tone = "primary", icon, disabled,
}: Props) {
  const toneMap = {
    primary: { bg: "from-primary/10 via-primary/5 to-transparent", border: "border-primary/30", btn: "bg-primary hover:bg-primary-hover text-primary-foreground", iconBg: "bg-primary text-primary-foreground" },
    success: { bg: "from-success/10 via-success/5 to-transparent", border: "border-success/30", btn: "bg-success hover:bg-success/90 text-white", iconBg: "bg-success text-white" },
    warning: { bg: "from-warning/10 via-warning/5 to-transparent", border: "border-warning/30", btn: "bg-warning hover:bg-warning/90 text-white", iconBg: "bg-warning text-white" },
    gold:    { bg: "from-[hsl(var(--gold))]/15 via-[hsl(var(--gold))]/5 to-transparent", border: "border-[hsl(var(--gold))]/40", btn: "bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(var(--gold-foreground))]", iconBg: "bg-[hsl(var(--gold))] text-[hsl(var(--gold-foreground))]" },
  } as const;
  const t = toneMap[tone];

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3 rounded-xl border-2 bg-gradient-to-r p-3 shadow-sm",
      t.bg, t.border,
    )}>
      <div className={cn("rounded-lg p-2 shrink-0", t.iconBg)}>
        {icon ?? <Sparkles className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Próxima ação</p>
        <p className="text-sm font-semibold text-navy truncate">{title}</p>
        {description && <p className="text-[11.5px] text-muted-foreground truncate">{description}</p>}
      </div>
      <Button
        size="sm"
        onClick={onAction}
        disabled={disabled}
        className={cn("gap-1.5 shrink-0 font-semibold", t.btn)}
      >
        {actionLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

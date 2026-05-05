import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Caminho de fallback caso não haja histórico de navegação. */
  fallback?: string;
  label?: string;
  className?: string;
}

/**
 * Botão "Voltar" global. Usa o histórico do navegador; se não houver,
 * volta para a rota de fallback (default: "/").
 */
export const BackButton = ({ fallback = "/", label = "Voltar", className }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // history.idx > 0 indica que há páginas no stack desta SPA
    const state = window.history.state as { idx?: number } | null;
    const hasHistory = (state?.idx ?? 0) > 0;
    if (hasHistory) navigate(-1);
    else navigate(fallback);
  };

  // Não mostrar em rotas-raiz (heurística simples: apenas quando profundidade > 1
  // ou quando há histórico). Para garantir presença em listas, sempre renderiza.
  void location;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("gap-1.5 -ml-2 h-8 px-2 text-muted-foreground hover:text-foreground", className)}
      aria-label="Voltar"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Button>
  );
};

export default BackButton;

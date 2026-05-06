import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

/** Captura erros de render para evitar tela branca. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary capturou:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border bg-card p-6 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error.message || "Erro inesperado na aplicação."}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={this.reset}>Tentar novamente</Button>
            <Button onClick={() => window.location.reload()}>Recarregar</Button>
          </div>
        </div>
      </div>
    );
  }
}

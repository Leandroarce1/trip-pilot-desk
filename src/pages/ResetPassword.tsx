import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plane } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase coloca a sessão de recovery automaticamente via hash do link.
    // Aguardamos o evento PASSWORD_RECOVERY ou uma sessão ativa.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Senha muito curta", { description: "Use ao menos 6 caracteres." });
      return;
    }
    if (password !== confirm) {
      toast.error("Senhas não coincidem");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Falha ao redefinir", { description: error.message });
    } else {
      toast.success("Senha atualizada!", { description: "Você já está logado." });
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-[hsl(var(--navy-hover))] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary-soft))] flex items-center justify-center shadow-xl mb-4">
            <Plane className="h-7 w-7 text-navy" />
          </div>
          <h1 className="text-2xl font-bold text-navy-foreground">Redefinir senha</h1>
          <p className="text-sm text-navy-foreground/60 mt-1">Escolha uma nova senha para sua conta</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-6 border border-border">
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Validando link de recuperação…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-pwd">Nova senha</Label>
                <Input id="new-pwd" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="confirm-pwd">Confirmar senha</Label>
                <Input id="confirm-pwd" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Salvando…" : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

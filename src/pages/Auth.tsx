import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Plane } from "lucide-react";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error("Falha no login", { description: error.message });
    else toast.success("Bem-vindo de volta!");
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Digite seu e-mail", { description: "Preencha o campo de e-mail antes." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error("Falha ao enviar e-mail", { description: error.message });
    else toast.success("E-mail enviado!", { description: "Confira sua caixa de entrada para redefinir a senha." });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectUrl },
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        toast.error("E-mail já cadastrado", { description: "Faça login na outra aba." });
      } else {
        toast.error("Falha no cadastro", { description: error.message });
      }
    } else {
      toast.success("Conta criada!", { description: "Você já está logado." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-[hsl(var(--navy-hover))] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary-soft))] flex items-center justify-center shadow-xl mb-4">
            <Plane className="h-7 w-7 text-navy" />
          </div>
          <h1 className="text-2xl font-bold text-navy-foreground">FlowDestinos</h1>
          <p className="text-sm text-navy-foreground/60 mt-1">CRM para agentes de viagens</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-6 border border-border">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="login-pwd">Senha</Label>
                  <Input id="login-pwd" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Entrando…" : "Entrar"}
                </Button>
                <button
                  type="button"
                  onClick={handleForgot}
                  disabled={busy}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
                >
                  Esqueci minha senha
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="su-email">E-mail</Label>
                  <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="su-pwd">Senha</Label>
                  <Input id="su-pwd" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                  <p className="text-[11px] text-muted-foreground mt-1">Mínimo 6 caracteres.</p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Criando…" : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => { if (user) nav("/dashboard"); }, [user, nav]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message); else nav("/dashboard");
  };
  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Conta criada! Verifique seu e-mail para confirmar.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-canva flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-display font-bold text-gradient-brand">RotuLab</span>
        </Link>
        <Card className="p-8 shadow-elevated border-border/60">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <div><Label>E-mail</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
                <div><Label>Senha</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-canva hover:opacity-90 shadow-glow">
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <div><Label>Nome</Label><Input value={name} onChange={e=>setName(e.target.value)} required /></div>
                <div><Label>E-mail</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
                <div><Label>Senha</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required /></div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-canva hover:opacity-90 shadow-glow">
                  {loading ? "Criando..." : "Criar conta gratuita"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

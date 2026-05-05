import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Layers, FileText, Download, Palette, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-canva flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-gradient-brand">RotuLab</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard"><Button>Meus projetos</Button></Link>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost">Entrar</Button></Link>
              <Link to="/auth"><Button className="bg-gradient-canva shadow-glow">Começar grátis</Button></Link>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 pt-16 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border/60 text-sm text-muted-foreground mb-6">
            <Zap className="w-3.5 h-3.5 text-accent" /> O Canva dos rótulos de suplementos
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-extrabold leading-tight">
            Crie rótulos <span className="text-gradient-brand">profissionais</span><br/>
            para nutracêuticos em minutos
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Editor drag-and-drop, tabela nutricional ANVISA, código de barras e exportação em PDF pronto para gráfica.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="bg-gradient-canva shadow-glow text-base px-8 h-12">Criar meu primeiro rótulo</Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Layers, title: "Editor visual", desc: "Drag-and-drop com camadas, formas, textos e imagens." },
            { icon: FileText, title: "ANVISA pronto", desc: "Tabela nutricional, advertências e ingredientes auto." },
            { icon: Download, title: "PDF para gráfica", desc: "Exportação em alta resolução pronta para impressão." },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/60 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-gradient-canva flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

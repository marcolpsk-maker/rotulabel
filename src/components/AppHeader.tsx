import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, Building2, LogOut, LayoutGrid } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function AppHeader({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const initial = (user?.email ?? "?")[0].toUpperCase();
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-40">
      <Link to="/dashboard" className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-canva flex items-center justify-center shadow-glow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-gradient-brand">RotuLab</span>
      </Link>
      {children}
      <div className="ml-auto flex items-center gap-2">
        <Link to="/dashboard"><Button variant="ghost" size="sm"><LayoutGrid className="w-4 h-4 mr-1.5"/>Meus projetos</Button></Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-gradient-canva text-white font-semibold text-sm flex items-center justify-center shadow-md">
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user?.email}</div>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={() => nav("/empresa")}><Building2 className="w-4 h-4 mr-2"/>Dados da empresa</DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={async () => { await signOut(); nav("/"); }}><LogOut className="w-4 h-4 mr-2"/>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

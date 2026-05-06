import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Projects from "./pages/Projects";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/editor"} component={Editor} />
      <Route path={"/editor/:id"} component={Editor} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'#facc15',color:'#000',textAlign:'center',fontSize:12,padding:'2px',fontWeight:700}}>
            ✅ BUILD NOVO ATIVO — Rotulabel v2 ({new Date().toISOString().slice(0,10)})
          </div>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

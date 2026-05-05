import { cn } from "@/lib/utils";
import { Check, ClipboardList, PenTool, Building2, Download } from "lucide-react";

export type WizardStep = "product" | "company" | "nutrition" | "design" | "export";

const steps: { id: WizardStep; label: string; icon: any }[] = [
  { id: "product", label: "Produto", icon: ClipboardList },
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "nutrition", label: "Nutricional", icon: ClipboardList },
  { id: "design", label: "Design", icon: PenTool },
  { id: "export", label: "Finalizar", icon: Download },
];

export default function EditorWizard({ currentStep, onStepChange }: { 
  currentStep: WizardStep; 
  onStepChange: (step: WizardStep) => void 
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full bg-card border-b border-border px-8 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-canva -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <button
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                  isCompleted ? "bg-primary border-primary text-white shadow-glow" : 
                  isActive ? "bg-background border-primary text-primary shadow-glow ring-4 ring-primary/10" : 
                  "bg-muted border-muted text-muted-foreground hover:border-muted-foreground/30"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </button>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

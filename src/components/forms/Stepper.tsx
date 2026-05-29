import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  title: string;
  description?: string;
}

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                  done
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", !active && !done && "text-muted-foreground")}>
                  {s.title}
                </p>
                {s.description && (
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-px mx-4", done ? "bg-primary" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
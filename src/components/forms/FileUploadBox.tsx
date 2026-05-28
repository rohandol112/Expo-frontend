import { useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUploadBox({
  label,
  hint,
  icon: Icon = ImageIcon,
  accept,
  className,
}: {
  label: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accept?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>();
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-2 w-full rounded-lg border border-dashed border-input bg-muted/30 py-8 px-4 hover:bg-muted/50 transition",
        className,
      )}
    >
      <Icon className="h-7 w-7 text-muted-foreground" />
      <span className="text-sm font-medium">{name ?? label}</span>
      {hint && <span className="text-xs text-muted-foreground text-center">{hint}</span>}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => setName(e.target.files?.[0]?.name)}
      />
    </button>
  );
}